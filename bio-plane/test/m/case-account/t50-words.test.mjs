/* case-account T50 (N1132; DEC-315, K3707; setup-words R11–R13): R16 and the words by key. The module's own source holds no
   sentence that `words.json` holds, comments aside, and the four DEC-315 refusals answer the list's own sentence, read by
   key. Each with its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { world } from "./fixture.mjs";
import { WORD } from "./words.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const LIST = JSON.parse(readFileSync(join(ROOT, "docs/development/ux-substrate/screens/words.json"), "utf8"));
const SRC = join(ROOT, "bio-plane/src/case-account");

/* the sentences the list holds long enough to be a copy (a shorter one, "the count is undetermined", is a fragment of prose) */
const SENTENCES = LIST.words.map((w) => w.en).filter((en) => typeof en === "string" && en.length >= 25);

/* a module's member-facing text: its source with comments taken out, and each string's `" + "` joins closed */
const spoken = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1").replace(/"\s*\+\s*"/g, "");

const copies = (text) => SENTENCES.filter((en) => spoken(text).includes(en));

test("R16 (N1132) the module holds no copy of a words.json sentence: its source, comments aside, carries none, and a copy is seen (control)", () => {
  const files = readdirSync(SRC).filter((f) => f.endsWith(".mjs")).map((f) => join(SRC, f));
  for (const f of files) assert.deepEqual(copies(readFileSync(f, "utf8")), [], f);
  const planted = `export const X = "${WORD("refusal.BAD_ACCOUNT")}";`;
  assert.deepEqual(copies(planted), [WORD("refusal.BAD_ACCOUNT")], "control: a copied sentence is seen");
});

test("R1, R4, R5 (DEC-315; N1132) NO_SUCH_ACCOUNT_DRAFT answers words.json's sentence by key, and writes nothing; control: a draft that exists is taken", () => {
  const w = world();
  const before = w.snapshot();
  const r = w.cacc.accountDraftJudged("ACD-2026-0404", "CASE-2026-0404", [{ text: "A.", cites: [] }]);
  assert.deepEqual([r.ok, r.reason], [false, "NO_SUCH_ACCOUNT_DRAFT"]);
  assert.equal(r.detail, WORD("refusal.NO_SUCH_ACCOUNT_DRAFT"));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.deepEqual(w.cacc.accountDraftJudged(null, "CASE-2026-0404", []), { ok: true, draft: null, framing: null, form: null },
                   "control: no draft named is no refusal");
});

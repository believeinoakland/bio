/* retrieval's words (T50-10; N1116, K3366, K3632; plan rule 6; `setup-words` R11-R13): the module holds keys and reads each
   sentence through `setup-words`' `word`. Its key list is the design stream's declaration for `retrieval`
   (`words-reads.json`), every key is one the list holds, and the sentences it answers are the list's word for the key, so a
   change of the list's English reaches an answer with no edit here. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasWord, word as WORD, localize } from "../../../src/setup-words/index.mjs";
import { WORD_KEYS, say, keysRead } from "../../../src/retrieval/words.mjs";
import { MEANING_READ_CHECKS, SELECTION_CHECKS, CAPTURE_TEXT_SKIPPED_SAYS } from "../../../src/retrieval/index.mjs";
import { world, V } from "./fixture.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules.retrieval.reads;

test("R10, R16, R19, R20 (plan rule 6): the module's keys are the owner's declared list for retrieval, every one held by the word list; a key outside it is refused, a placeholder with no value is refused", () => {
  assert.deepEqual([...WORD_KEYS].sort(), [...READS].sort());
  for (const k of WORD_KEYS) assert.equal(hasWord(k), true, k);
  assert.throws(() => say("not.a.key"), /not one of this module's word keys/);
  assert.equal(WORD_KEYS.length, 49, "DEC-334: the 15 keys of the find and the browse left with the split");
  assert.throws(() => say("retrieval.text.tally_covers_first"), /WORD_VAR_MISSING/);
  assert.equal(say("retrieval.text.tally_covers_first", { bound: 500 }), WORD("retrieval.text.tally_covers_first", { bound: 500 }));
});

test("R10, R19, R20, R31 (plan rule 6): every refusal row's translation is the word of its refusal key, no two alike", () => {
  assert.equal(MEANING_READ_CHECKS.MEANING_ROWS_NO_ARM.translation, WORD("refusal.MEANING_ROWS_NO_ARM"));
  assert.equal(MEANING_READ_CHECKS.MEANING_ROWS_UNKNOWN_ARM.translation, WORD("refusal.MEANING_ROWS_UNKNOWN_ARM"));
  assert.equal(SELECTION_CHECKS.NO_SUCH_SELECTION.translation, WORD("refusal.NO_SUCH_SELECTION"));
  assert.equal(SELECTION_CHECKS.SET_MOVED.translation, WORD("refusal.SET_MOVED"));
  const all = [...Object.values(MEANING_READ_CHECKS), ...Object.values(SELECTION_CHECKS)].map((r) => r.translation);
  assert.equal(new Set(all).size, all.length);
  for (const t of all) assert.doesNotMatch(t, /\bgroup\b/i, "DEC-149: team, never group");
});

test("R16, R27, R13 (plan rule 6): the sentences the module answers are the list's words — the syntax sentences, the content-axis notes, the no-later-module line, the 'not indexed' words", () => {
  const w = world();
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  const syntax = w.retrieval.searchFields().syntax;
  for (const k of ["bare_words_ranked", "quoted_phrase_unit", "term_prefix_match", "term_term_exclude", "parentheses_nest", "near_finds_words",
                   "field_value_filters", "field_asks_field", "fm_path_fm", "leg_resolves_concerns", "passage_searches_documents",
                   "content_cap_undetermined", "content_chain_apply", "content_cap_apply", "leg_asks_record", "sort_field_sort"])
    assert.ok(syntax.includes(WORD(`retrieval.syntax.${k}`)), k);
  assert.ok(syntax.includes(WORD("retrieval.index.content_searches_citations")), "R13, R14: the content-axis sentence is read by its key");
  assert.equal(w.retrieval.contentAxis({}).note, WORD("retrieval.note.content_axis_read"));
  const held = w.retrieval.contentAxis({ captureSha: "f".repeat(64), viewer: V("ann") });
  assert.equal(held.note, WORD("retrieval.note.record_holds_capture", { content_axis_states: Object.keys(held.vocabulary)[3] }));
  assert.equal(CAPTURE_TEXT_SKIPPED_SAYS, WORD("retrieval.capture_text_skipped_says"));
  const f = w.retrieval.frontier({ level: "document" });
  assert.equal(f.found, true);
  for (const k of ["retrieval.note.content_axis_read", "retrieval.note.record_holds_capture", "retrieval.syntax.near_finds_words"])
    assert.ok(keysRead().has(k), k);
});

test("R13, R14 (plan rule 6): the four-level statement's sentences are the list's words with the numbers filling the placeholders — the passage arm leads with its coverage", () => {
  const w = world();
  const c = w.cap("a.pdf", "a bytes");
  w.doc("INFO-A", {}, { captures: [c] });
  const ans = w.retrieval.meaningRows({ rows: "passage", q: "passage:zzz", viewer: V("ann") });
  const sc = ans.scope;
  const coverage = WORD("retrieval.text.capture_counted_scope", { captures_counted: sc.captures_counted, searchable: 0, full: 0, part: 0, none: 0,
    never: 0, unread_undet: 1, index_undet: 0, over: "" });
  assert.equal(ans.levels.content.why, WORD("retrieval.why.matching_unit_over", { total: 0, with_rows: 0, documents: 1, coverage }));
  assert.equal(ans.says, `${WORD("retrieval.lead", { coverage })} ${WORD("retrieval.text.matched_scope_searchable")}`);
  assert.equal(ans.levels.internet.why, WORD("retrieval.why.anybody_looked_all"));
  for (const k of ["retrieval.lead", "retrieval.text.capture_counted_scope", "retrieval.why.matching_unit_over", "retrieval.text.matched_scope_searchable"])
    assert.ok(keysRead().has(k), k);
});

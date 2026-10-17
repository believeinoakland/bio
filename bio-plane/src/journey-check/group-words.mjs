/* journey-check R17 (N1160, U15; DEC-281; K3472): no served page or word row says "group" for a team. The design's own
   build (`docs/development/ux-substrate/screens/build_words.mjs`) holds the rule: `TEAM_WORD`, the word as a member reads
   it, and `GROUP_SENSE`, the rows that keep it in another sense (a grouping of reasons, legs or cases, or a kind of
   organization in the world). Both are read from that file as data, never copied here, so a row the design allows is
   allowed here and one it does not is not. Identifiers (`{group}`, `group-identity`, op names) are not text: `TEAM_WORD`
   leaves a word inside braces, a dotted key or a hyphenated name alone. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WORD_ROWS } from "../setup-words/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const BUILD_WORDS = join(ROOT, "docs", "development", "ux-substrate", "screens", "build_words.mjs");
export const WORDS_JSON = join(ROOT, "docs", "development", "ux-substrate", "screens", "words.json");

/* The regular-expression literal `const <name> = /…/flags;` of the design's build, as a RegExp. */
function literalOf(src, name) {
  const m = new RegExp(`^const ${name} = (/.+/[a-z]*);\\s*(?://.*)?$`, "m").exec(src);
  if (!m) throw new Error(`no \`const ${name} = /…/\` in ${BUILD_WORDS}: the design's rule is not where R17 reads it`);
  return new Function(`return ${m[1]}`)();
}

/* The design's rule: `{TEAM_WORD, GROUP_SENSE}`, the first read in any case ("group", "Group", "GROUPS"). */
export function designRule(file = BUILD_WORDS) {
  const src = readFileSync(file, "utf8");
  const team = literalOf(src, "TEAM_WORD"), sense = literalOf(src, "GROUP_SENSE");
  return { TEAM_WORD: new RegExp(team.source, team.flags.includes("i") ? team.flags : team.flags + "i"), GROUP_SENSE: sense };
}

/* A row's English as a member reads it: markup and the "more" span taken out (build_words.mjs `plain`). */
export const plain = (s) => String(s).replace(/<span class=["']?more["']?>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/* The places `text` says "group" for a team: `[{at}]`, each with the words around it. */
export function groupIn(text, { rule = designRule() } = {}) {
  const t = String(text).replace(/\s+/g, " ");
  const re = new RegExp(rule.TEAM_WORD.source, "gi");
  const out = [];
  for (const m of t.matchAll(re)) {
    const i = m.index + m[1].length;
    out.push({ at: t.slice(Math.max(0, i - 40), i + 45).trim() });
  }
  return out;
}

/* The rows of `rows` (`[{key, en}]`) that say "group" for a team: every row but those the design's `GROUP_SENSE` keeps. */
export function rowsSayingGroup(rows, { rule = designRule() } = {}) {
  const out = [];
  for (const r of rows) {
    if (rule.GROUP_SENSE.test(r.key)) continue;
    const at = groupIn(plain(r.en), { rule });
    if (at.length) out.push({ key: r.key, at: at[0].at });
  }
  return out;
}

/* The rows of `words.json` (the design's list) and of `setup-words` (the list the product serves), as `{key, en}`. */
export const designRows = (file = WORDS_JSON) => JSON.parse(readFileSync(file, "utf8")).words.map((w) => ({ key: w.key, en: w.en }));
export const setupRows = () => WORD_ROWS.map((r) => ({ key: r[0], en: r[1] }));

/* The drawn text of a page, with the rows `GROUP_SENSE` keeps taken out wherever they are drawn (a kind of organization a
   screen offers, a grouping its words name): what is left is a team, said as a team. `patterns` are those rows' words,
   as `wordPattern` makes them (words.mjs); `keys` the keys of `setup-words` the rule allows. */
export function senseKeys({ rule = designRule(), rows = setupRows() } = {}) {
  return rows.filter((r) => rule.GROUP_SENSE.test(r.key)).map((r) => r.key);
}
export function withoutGroupSense(text, patterns) {
  let t = String(text).replace(/\s+/g, " ");
  for (const re of patterns) t = t.replace(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"), " ");
  return t;
}

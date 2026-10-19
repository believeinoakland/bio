// Fixture tree: each rule (a)-(d) and each judgment case of build/tools/words-convert.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TOOL = join(dirname(fileURLToPath(import.meta.url)), '..', 'words-convert.mjs');
const { convert, verify, slug } = await import(TOOL);

function put(root, rel, text) { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); }

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'wc-'));
  const mod = (id, extra = {}) => ({ id, layer: 1, paths: [`bio-plane/src/${id}/`], tests: [`bio-plane/test/m/${id}/`], uses: [], ...extra });
  put(root, 'build/modules.json', JSON.stringify({ status: 'x', not_product: ['docs/', 'build/'], modules: [mod('setup-words'), mod('alpha'), mod('screens-beta'), mod('strength')] }));
  put(root, 'docs/development/ux-substrate/screens/words.json', JSON.stringify({ words: [
    { key: 'alpha.greeting', en: 'Welcome back to your workspace' },
    { key: 'alpha.total', en: 'The total for the whole month is {total} dollars in all' },
    { key: 'alpha.dup1', en: 'This sentence appears under two keys' },
    { key: 'alpha.dup2', en: 'This sentence appears under two keys' },
  ] }));
  put(root, 'bio-plane/src/setup-words/index.mjs', 'export const word = (k) => k;\n');
  put(root, 'bio-plane/src/alpha/index.mjs', [
    "import { x } from './other.mjs';",
    "export const A = 'Welcome back to your workspace';",
    'export const B = (amount) => `The total for the whole month is ${amount} dollars in all`;',
    "export const C = 'Nothing was found for that request.';",
    'export const D = (member, group_) => `${member.name} was removed from ${group_.title()} just now.`;',
    "export const E = 'Please look again at this request, ' + x + '.';",
    "export const E2 = 'A sentence joined from ' + 'two literals that read well.';",
    "export const E3 = 'A sentence with a comment ' + // why\n      'inside its chain here.';",
    "export const E4 = 1 + 2 + ' is the sum of the two numbers';",
    "export const F = { 'Another sentence used as a key here.': 1 };",
    "export function G(m = 'A default sentence for the parameter.') { return m; }",
    "export function H(k) { switch (k) { case 'A sentence in a switch case here.': return 1; } }",
    "export const I = 'This sentence appears under two keys';",
    'export const K = (n) => `Showing ${n + 1} of ${n} results now.`;',
    '',
  ].join('\n'));
  put(root, 'bio-plane/src/alpha/shadow.mjs', "export const M = (f) => { const localize = f; return localize('This sentence has a local marker in the file.'); };\nexport const N = 'Another sentence in a file that binds the marker.';\nexport const O = 'Welcome back to your workspace';\n");
  put(root, 'bio-plane/src/alpha/wordbound.mjs', "const word = (w) => w.trim();\nexport const Q = word(' x ');\nexport const R = 'Welcome back to your workspace';\n");
  put(root, 'bio-plane/src/alpha/words.mjs', "export const TEXT = {\n  empty: \"Nobody has replied to this notice yet.\",\n  due: 'Noticed: no reply recorded by {date}',\n};\n");
  put(root, 'bio-plane/src/alpha/legacy.cjs', "module.exports = { s: 'A sentence in a CommonJS file here.' };\n");
  put(root, 'bio-plane/src/screens-beta/index.mjs', "export const S = 'A drawn screen sentence with no row.';\nexport const W = 'Welcome back to your workspace';\n");
  put(root, 'bio-plane/src/strength/index.mjs', "export const P = 'A pinned method sentence of the strength.';\n");
  put(root, 'bio-plane/test/m/alpha/a.test.mjs', [
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { A, B } from '../../../src/alpha/index.mjs';",
    "test('x', () => {",
    "  assert.equal(A, 'Welcome back to your workspace');",
    '  assert.equal(B(5), `The total for the whole month is ${5} dollars in all`);',
    "  assert.ok(A.includes('Welcome back to your workspace and more'));",
    '});',
    '',
  ].join('\n'));
  execFileSync('git', ['-C', root, 'init', '-q']);
  execFileSync('git', ['-C', root, 'add', '-A']);
  return root;
}

const rd = (root, rel) => readFileSync(join(root, rel), 'utf8');

test('slug', () => assert.equal(slug("The run's 8 total: confirmed-cites é {name} more words"), 'the_runs_8_total_confirmed'));

test('rules a, b, c, d and the judgment cases', async () => {
  const root = fixture();
  const rep = await convert(root, { write: true });
  const idx = rd(root, 'bio-plane/src/alpha/index.mjs');
  assert.match(idx, /^import \{ x \} from '\.\/other\.mjs';\nimport \{ word, localize \} from '\.\.\/setup-words\/index\.mjs';/);
  assert.match(idx, /A = word\('alpha\.greeting'\);/);
  assert.match(idx, /B = \(amount\) => word\('alpha\.total', \{ total: String\(amount\) \}\);/);
  assert.match(idx, /C = localize\('alpha\.index\.nothing_was_found_for_that', 'Nothing was found for that request\.'\);/);
  assert.match(idx, /D = \(member, group_\) => localize\('alpha\.index\.name_was_removed_from_title', '\{name\} was removed from \{title\} just now\.', \{ name: String\(member\.name\), title: String\(group_\.title\(\)\) \}\);/);
  assert.match(idx, /E = localize\('alpha\.index\.please_look_again_at_this', '[^']*\{x\}\.', \{ x: String\(x\) \}\);/); // a chain of literals and an expression
  assert.match(idx, /E2 = localize\('alpha\.index\.a_sentence_joined_from_two', 'A sentence joined from two literals that read well\.'\);/);
  assert.match(idx, /E3 = 'A sentence with a comment ' \+ \/\/ why/); // a comment inside the chain: untouched
  assert.match(idx, /E4 = localize\('alpha\.index\.v1_is_the_sum_of', '\{v1\} is the sum of the two numbers', \{ v1: String\(1 \+ 2\) \}\);/); // a numeric sum stays one operand
  assert.match(idx, /'Another sentence used as a key here\.': 1/);
  assert.match(idx, /m = 'A default sentence for the parameter\.'/);
  assert.match(idx, /case 'A sentence in a switch case here\.'/);
  assert.match(idx, /I = 'This sentence appears under two keys';/); // ambiguous
  assert.match(idx, /K = \(n\) => localize\('alpha\.index\.showing_v1_of_n_results', 'Showing \{v1\} of \{n\} results now\.', \{ v1: String\(n \+ 1\), n: String\(n\) \}\);/);
  assert.equal(rd(root, 'bio-plane/src/alpha/shadow.mjs').includes("N = 'Another sentence in a file that binds the marker.'"), true);
  assert.match(rd(root, 'bio-plane/src/alpha/shadow.mjs'), /O = word\('alpha\.greeting'\)/); // rule (a) still applies where the marker is bound; localize already bound anywhere in the file: untouched
  assert.match(rd(root, 'bio-plane/src/alpha/wordbound.mjs'), /R = localize\('alpha\.greeting', 'Welcome back to your workspace'\);/); // a file binding word reads the row through the marker by its key
  const words = rd(root, 'bio-plane/src/alpha/words.mjs');
  assert.match(words, /^import \{ localize \} from '\.\.\/setup-words\/index\.mjs';/);
  assert.match(words, /empty: localize\("alpha\.words\.nobody_has_replied_to_this", "Nobody has replied to this notice yet\."\)/); // quote style kept
  assert.match(words, /due: 'Noticed: no reply recorded by \{date\}'/); // literal placeholder: judgment
  assert.equal(rd(root, 'bio-plane/src/alpha/legacy.cjs').includes('module.exports'), true);
  assert.equal(rd(root, 'bio-plane/src/screens-beta/index.mjs'), "export const S = 'A drawn screen sentence with no row.';\nexport const W = 'Welcome back to your workspace';\n"); // drawn modules: no rule applies
  assert.equal(JSON.parse(rd(root, 'build/modules.json')).modules.find((m) => m.id === 'alpha').uses.includes('setup-words'), true);
  assert.equal(rd(root, 'bio-plane/src/strength/index.mjs'), "export const P = 'A pinned method sentence of the strength.';\n");
  const tst = rd(root, 'bio-plane/test/m/alpha/a.test.mjs');
  assert.match(tst, /assert\.equal\(A, word\('alpha\.greeting'\)\);/);
  assert.match(tst, /assert\.equal\(B\(5\), word\('alpha\.total', \{ total: 5 \}\)\);/);
  assert.match(tst, /includes\('Welcome back to your workspace and more'\)/);
  const reasons = Object.keys(rep.judgmentCounts);
  for (const r of ['comment', 'object property key', 'default parameter', 'switch case', 'ambiguous', 'drawn module', 'signed or pinned text', 'localize already bound', 'non-module', 'text holds a literal']) assert.ok(reasons.some((x) => x.startsWith(r)), `reason ${r} in ${reasons.join(' | ')}`);
  assert.deepEqual(rep.totals, { a: 4, b: 6, c: 1, d: 2 });
  // verifier: clean, then catches a doctored edit
  assert.deepEqual(verify(rep), []);
  const bad = JSON.parse(JSON.stringify(rep));
  bad.converted.find((c) => c.rule === 'b' && c.id.endsWith('nothing_was_found_for_that')).call = "localize('alpha.index.nothing_was_found_for_that', 'Nothing was found.')";
  bad.written = false;
  assert.equal(verify(bad).length, 1);
});

test('a dry run writes nothing; a second run converts nothing more', async () => {
  const root = fixture();
  const before = rd(root, 'bio-plane/src/alpha/index.mjs');
  const rep = await convert(root);
  assert.equal(rd(root, 'bio-plane/src/alpha/index.mjs'), before);
  assert.ok(rep.converted.length > 0);
  await convert(root, { write: true });
  const again = await convert(root);
  assert.equal(again.converted.length, 0);
});

# Diagnosis R6: the plane idle (G39)

**Status** · Opened by BOB #255 (K4615). Measured 2026-10-22 on tranche/T51 (9452ddd27f), node v26.10, read-only on product source. **Finding: the idle is the module graph, not data.** Of the 86.7 MB (heap + array buffers) the Store idles at, about 77 MB is what importing the code costs (the bare isolate with the graph imported and nothing constructed is 84.1 MB; node alone is 7.0 MB); constructing the Store adds 2.6 MB. Half of it (43.5 MB) is the JavaScript source text of 818 product files held on the heap, and about 21 MB of that is only the two-byte widening caused by 18,274 non-ASCII characters (em dashes, section signs, box rules) in 651 files.

## Method and commands (reproduction)
The harness boots the Store with `await import(".../plane/register.mjs")`, then `store({ env: { CAPTURES: multipartBucket(), INSTANCE_NAME: "town" } })` (`harness.mjs:84-105`), then `gc(); gc()` and reads `heapUsed + arrayBuffers`. The probe below does exactly that boot (no document), in a child with `--expose-gc --max-semi-space-size=2`, writes a heap snapshot after two full GCs, and has a `bare` mode that stops before `store()`. Scripts are kept in the scratchpad `/tmp/claude-0/-home-user-bio/e5b6282b-031b-5fee-bc57-8fad537cd409/scratchpad/` (`idle.mjs`, `an4.mjs`, `an5.mjs`; `an3.mjs` is the dominator-tree walk); `idle.mjs` is reproduced here, the rest is described.

```
S=/tmp/claude-0/-home-user-bio/e5b6282b-031b-5fee-bc57-8fad537cd409/scratchpad
cd bio-plane
node --expose-gc --max-semi-space-size=2 $S/idle.mjs bare  $S/bare.heapsnapshot   # module graph imported, nothing constructed
node --expose-gc --max-semi-space-size=2 $S/idle.mjs store $S/store.heapsnapshot  # + the Store, as the harness boots it
node --max-old-space-size=4096 $S/an4.mjs $S/store.heapsnapshot   # script source strings by file, heap vs external; strings, by type
node --max-old-space-size=4096 $S/an5.mjs                         # the same joined to the file on disk (ASCII or not) and to modules.json
node --max-old-space-size=6000 $S/an3.mjs $S/store.heapsnapshot  # dominator tree: top retained non-code objects with their path from the root
```
`idle.mjs`: `import v8; await import(R+"/src/plane/register.mjs"); const fx = await import(R+"/test/m/plane/fixture.mjs"); const st = await import(R+"/test/m/record-core/storage.mjs"); if (mode==="store") keep = await fx.store({env:{CAPTURES: st.multipartBucket(), INSTANCE_NAME:"town"}}); gc(); gc(); print v8.getHeapStatistics().used_heap_size + process.memoryUsage().arrayBuffers; v8.writeHeapSnapshot(out)`. The snapshot scripts read `nodes`/`edges` of the `.heapsnapshot` JSON: a `code` node named `file://...` with an edge named `source` is a script, the target string its source; strings under the `(External strings)` root are off-heap (V8 external memory, not in `used_heap_size`); everything else is heap.

Results: bare 84.1 MB (arrayBuffers 0.3), store 86.7 MB (0.3), heap statistics `external` 17.9-18.0 MB beside (not in the harness figure). Node with nothing imported: 7.0 MB. Snapshot: 553,169 nodes, 1,017 scripts (818 product files, 199 node internals; no file is loaded twice).

## Split code / data (heap, MB; the 86.7 the harness counts)
| part | MB | of which |
|---|---|---|
| node itself (nothing imported) | 7.0 | |
| **code**: product source text on the heap | 43.5 | 22.6 MB would be the size if every file were one-byte; 20.9 MB is two-byte widening |
| **code**: compiled form (bytecode, scope infos, constant pools, feedback, SFI, closures) | about 17 | snapshot "code" 13.7 + closures 1.6 + hidden 1.5 |
| **data**: `WORD_ROWS` evaluated (25,617 rows of strings, `setup-words/rows.mjs:10`) | about 7.7 | measured by import delta |
| **data**: `DATA` JSON text of court-citations, held as the module's export | 3.3 | |
| **data**: other strings, literals and identifiers (internalized), arrays, objects, shapes | about 8 | strings 7.6, never one item over 90 KB |
| node module loader caches (`loadCache` 0.99, `resolveCache` 0.85) | 1.8 | not ours |
| Store construction | 2.6 | `translations` word map 0.88, `jurisdictions` map 0.24, rest small |

Code is about 68 MB (79%), data about 19 MB (21%). **Beside the 86.7, and not in the harness figure, 31.4 MB of script source is held as external strings** (the four generated modules, 27.3 MB, plus undici 0.8): that is V8 external memory, which the harness does not add (`harness.mjs` `used()`), but which workerd may charge to the object; not measured here.

## Top 15 retained items
| # | item | MB | where | in/out of the harness figure |
|---|---|---|---|---|
| 1 | source text of the 651 files with a non-ASCII character, two bytes a character | 42.5 (22.6 MB on disk for the heap-held files; 4 generated files over 2 MB are external, rows 3, 4, 8, 10) | every file; largest `control-plane/index.mjs` 0.58, `op-declarations/index.mjs` 0.50, `ai-runs/index.mjs` 0.49, `monitoring/index.mjs` 0.47, `capture/index.mjs` 0.47 | in |
| 2 | source of the 168 ASCII-only files, one byte | 1.1 | `retrieval/words.mjs`, `progressions/*` | in |
| 3 | `case-checker/program.mjs` source, one 6.4 MB string literal returned by `programData()` | 12.25 | `case-checker/program.mjs:3`, read by `case-checker/index.mjs:23,44` | external |
| 4 | `setup-words/rows.mjs` source | 9.13 | `setup-words/rows.mjs:10` | external |
| 5 | `WORD_ROWS` evaluated (frozen array of 25,617 six-field rows) | 7.7 | `setup-words/rows.mjs:10`, re-exported `setup-words/index.mjs:4,6` | in |
| 6 | compiled code and metadata of the 818 files | about 17 | all | in |
| 7 | small strings (identifiers, literals) | 7.6 | all | in |
| 8 | `court-data.mjs` source | 3.73 | `court-citations/court-data.mjs:9` | external |
| 9 | `DATA`, the 3.29 MB JSON text, held for the life of the isolate though `load()` parses it only on first use | 3.29 | `court-citations/court-data.mjs:9`, `court-citations/index.mjs:5,17` | in |
| 10 | `interface-assets/index.mjs` source (15 base64 faces, css, icons) | 2.21 | `interface-assets/index.mjs:10` (`ASSET_FILES`) | external |
| 11 | node module loader caches | 1.84 | node:internal | in |
| 12 | `translations` `WORD_BY_KEY` Map (a second keyed copy of the words, built when the module loads) | 0.88 | `translations/index.mjs:39` | in |
| 13 | `setup-words` `rowsByKey` Map (built on first `word`) | about 0.9 when built (not built at idle) | `setup-words/index.mjs:9` | in, lazy |
| 14 | `jurisdictions` `HELD` map of frozen profile clones | 0.24 | `jurisdictions/index.mjs:1604` | in |
| 15 | `Generator` closures of filing templates | 0.27 + 0.14 | `filings` / `jurisdictions` template generators | in |

(Items 1-2 and 6-7 are classes of many small things: no single object beyond the generated strings is over 1 MB retained; the dominator walk finds no data structure above 0.9 MB.) By module (source text resident, MB; `build/modules.json` paths): case-checker 12.6 (9 files, 6.3 MB on disk), setup-words 9.1 (4.6), court-citations 3.7 (1.9), interface-assets 2.2 (1.1), then no module over 1.1 (screens-inquiry 1.1, screens-settings 0.7, control-plane, op-grades, screens-action, promotion, op-declarations, capture, wizard-scripts, monitoring, jurisdictions each about 0.6).

## Needed at idle, and the candidate fixes
**1. Non-ASCII characters in source: 20.9 MB of the 86.7 (the largest single cause).** V8 keeps a source with any character above U+00FF as a two-byte string; the 168 ASCII-only files are one byte. 18,274 characters in 651 files do it: em dash U+2014 7,391, box rule U+2500 3,788, section sign 2,351, en dash 2,056, middle dot 788, ellipsis 560, arrows and curly quotes. 263 of the files have them only in comments, the rest also in string literals (e.g. `setup-words/rows.mjs`, 1,586 of them; that file is 9.1 MB resident for 4.8 MB on disk). Not needed at idle as two-byte: a source that is ASCII costs half. Fix: write the bundle/modules ASCII-only: a build step (the platform bundle, `bundler`; or a repository check) that rewrites non-ASCII in code strings to `\uXXXX` escapes and replaces them in comments with ASCII, or strips comments (15.6 MB of the 38 MB of characters are comments). Estimated saving, from the snapshot arithmetic and not an applied run: 21 MB heap (43.5 to 22.6). Owner: `bundler` (`build/modules.json` helper) for a build step; each module's text for a source-level change. Caveat: workerd stores the deployed bundle's source its own way; whether it is two-byte there depends on the bundle, so one measurement of the real bundle is needed before counting the 21 MB (an experiment with a load hook that escaped all non-ASCII was inconclusive here because the hook's strings are not externalized: it showed 113 MB).
**2. The four generated data modules carry their data as source text (31 MB external, plus 11 MB of heap).**
- `case-checker/program.mjs:3` (12.25 MB resident, 6.4 MB on disk): the case-file program is a JSON text with escapes inside a JS string literal, read only by `caseCheckerProgramText()` at `case-checker/index.mjs:42-48` (a served file, parsed on first call and kept). Needed at idle: no, it is served on request. Fix: make it ASCII (halves it to 6.4 MB) or load it on demand from R2/an asset instead of an import; with `import()` on first use it costs nothing at idle. Owner: `case-checker`.
- `setup-words/rows.mjs:10` (9.13 MB source, plus 7.7 MB heap once evaluated): 25,617 rows, held both as `WORD_ROWS` and again by `translations/index.mjs:39` (`INTERFACE_WORDS` map). Needed at idle: only the keys the screens ask for; a word is looked up by key (`setup-words/index.mjs:9`). Fix: hold once (the `translations` map built from `WORD_ROWS`, not a second structure), and make the source ASCII, or split the table by screen and import it when that screen first renders. Owner: `setup-words`, with `translations` for the second map.
- `court-citations/court-data.mjs:9` (3.73 MB source + 3.29 MB `DATA` string in heap): `court-citations/index.mjs:11-17` is written so evaluation builds nothing (R11), yet `DATA` is a module export that stays in the heap as a 3.3 MB string whether or not a citation is ever checked. Fix: export a function (`export const data = () => "..."`, as `programData()` does) or dynamic-import it in `load()`, so the text is dropped after parse and not resident at idle. Owner: `court-citations`.
- `interface-assets/index.mjs:10` (2.21 MB source, base64 faces): needed when a page is served; fix: dynamic import at the first asset request. Owner: `interface-assets`.
**3. The compiled form (about 17 MB) and the 7.6 MB of small strings follow the amount of source loaded.** Every module imports at start (the plane's entries import all 818 product files at start); screens, wizard scripts, filings and the rest are loaded at idle though one request uses a few. Fix: load the screen and wizard modules on first use. This is a change in layering (`control-plane`, the screens modules, `plane/store.mjs`) and a BOB decision on boundaries; not sized here.

## Which fix is worth it
(1) ASCII source: about 21 MB, mechanical, one owner (`bundler`) plus a repository check. (2) The four generated modules: case-checker program and court `DATA` out of the heap at idle (about 3.3 MB heap, and up to 31 MB external if workerd charges it); setup-words second copy and rows (up to 8 MB heap). Together, the idle goes from 86.7 to at most about 55 MB in this measure, leaving 70 MB for work against the 40 MB now.

## Not covered
Node, not workerd: how workerd holds module source (external or heap, one or two bytes) is not measured. No change was applied; the 21 MB and the lazy-load figures are arithmetic from the snapshot and import deltas. Import deltas depend on order (a module's transitive imports are charged to the first importer), so only the generated modules, which are leaves, were sized that way.

## In workerd (BOB #255)
**Status** · Measured 2026-10-22 on tranche/T51 in a scratch worktree (nothing in the checkout changed but this section). The measure is the one `diagnosis-R6-memory.md` "Platform check" names: the plane's own bundle, run in raw workerd (`bio-plane/node_modules/.bin/workerd`, 2026-07-22, compatibility date 2026-07-01, `nodejs_compat`) with `v8Flags = ["--max-old-space-size=N"]` and a SQLite Durable Object `Store` as `wrangler.jsonc` declares it (no R2 or service bindings); the smallest N at which the object boots and answers is found by bisection. workerd gives no memory reading (no `process.memoryUsage`, no heap statistics), so the cap that still boots is the measure: it is the V8 old-space the idle plane needs, to 1-2 MB (a boot is one pass or one fail, repeated 2 to 3 times at the edge for A: 84 fails, 86 and 88 pass). It does not count memory outside V8's heap.

**Commands.** In a worktree (`git worktree add --detach <scratch>/wt-idle HEAD`, `bio-plane/node_modules` symlinked), `bio-plane/scripts/fleet-bundle.mjs` `optionsFor` patched to merge `JSON.parse(process.env.EXTRA_OPTS)` into esbuild's options (scratch only), and `planeMember()`/`buildMember(m, {write:false})` as `build-plane.mjs` does, the bytes written to a scratch file: `EXTRA_OPTS='{"charset":"ascii","legalComments":"none","minifyWhitespace":true,"supported":{"template-literal":false}}' node build-variant.mjs out.mjs`. The run: a wrapper module `main.mjs` (`import real, {Store as RealStore} from "plane"; export class Store extends RealStore {async ping(){return JSON.stringify({ok:true, alarm: await this.schedAlarmAt()})}}`; `fetch`: `/version` goes to the real default export, `/store` to `env.STORE.get(idFromName("town")).ping()`, which constructs the Store and reads the scheduler), the variant as module `plane`, and a capnp config (`service` with `modules`, `durableObjectNamespaces = [(className="Store", uniqueKey=..., enableSql=true)]`, `durableObjectStorage = (localDisk=...)`, `v8Flags`). A pass is `/version` answering `0.86.0` and `/store` answering `{"ok":true,...}` inside 60 s; N bisected between 24 and 128. The scripts (`build-variant.mjs`, `wd/run.sh`, `wd/bis.sh`, `wd/main.mjs`) are in the scratchpad only.

**Two facts found on the way, both change the candidates.**
1. **esbuild's default charset is already ASCII**, so (B) `charset: "ascii"` builds a byte-identical bundle (sha256 equal to A): the 18,274 non-ASCII characters in the sources of the node measure are not in the bundle's strings (`—` escapes: 1,200 lines). What is in the bundle is 3,566 non-ASCII characters in the comments esbuild keeps (11,405 comment lines), which is enough to make the whole 32.5 MB script text two-byte. Stripping comments (C) leaves 133 non-ASCII characters in template literals and regex literals (em/en dashes, curly quotes, `§`, `€`, `￿`), so the script stays two-byte; only with those escaped as well is the bundle pure ASCII (C3). esbuild has no option for the regex-literal part, so C3 is C plus `supported: {"template-literal": false}` (templates lowered to strings, which `charset` then escapes) plus a post-pass over the output that rewrites every remaining non-ASCII character to `\uXXXX` (`node --check` clean; all remaining ones were inside regex literals; non-BMP as surrogate-pair escapes).
2. **A dynamic `import()` in a one-part bundle moves no source out.** esbuild (no splitting) inlines the module and evaluates it lazily, but the 6.4 MB and 3.7 MB string literals stay in the script text V8 holds, so (D) saves only the evaluated `DATA`/parse cost. Getting the text out of the isolate needs the data as a part outside the script (an R2 object, an asset, a second module part, which a one-part installer upload (bundler's reason to exist) does not carry), measured here as D-ext (the two modules stubbed to empty strings).

| variant | what | bundle MB | smallest cap that boots and answers | MB saved vs A |
|---|---|---|---|---|
| A | as built today | 32.5 | 86 | 0 |
| B | A + `charset: "ascii"` | 32.5 (identical to A) | 86 (not run twice: same bytes) | 0 |
| C | B + `legalComments: "none"`, `minifyWhitespace` (comments gone; 133 non-ASCII left in templates/regexes) | 26.7 | 76 | 10 |
| C3 | C + template literals lowered + remaining non-ASCII escaped (script is pure ASCII) | 26.9 | 50 | 36 |
| D | A + the two data modules behind `import()` (scratch patch) | 32.5 | 82 | 4 |
| D-ext | A + the two data modules' text not in the bundle (stubbed) | 24.6 | 67 | 19 |
| E | C3 + D | 26.9 | 46 | 40 |
| E-ext | C3 + D-ext | 18.8 | 38 | 48 |
| (extra) C2 | C + templates lowered, regex non-ASCII left | 26.9 | 76 | 10 |
| (extra) `minify` (+ ascii, no legal comments) | identifiers mangled, still two-byte | 24.5 | 70 | 16 |

Reading it: the plane as built needs 86 MB of old space in workerd just to boot and construct its Store (node measured 86.7; the same figure, the module graph again), leaving 42 of 128. Of that, 36 MB is the script text being two-byte; making the bundle pure ASCII takes it to 50 (78 left). Out of the isolate, the two data texts are a further 19 (E-ext: 38, 90 left), but only with a change of the plane's delivery, not with `import()`. Not measured: the cap bounds V8's heap only (a real object also holds its request's memory, R2 streams and the platform's own overhead), the bundle's behaviour under the tests (only a boot and one store read were run), and `minify`'s effect on names read by code (`fn.name`, class names, `constructor.name`; not grepped).

**What each change touches** (`build/modules.json`)
- C3 (ASCII bundle, the 36 MB): `bio-plane/scripts/fleet-bundle.mjs` (`optionsFor`, plus a post-pass in `buildMember`), owner `bundler`; the committed `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` move and the FL-9 gate (`fleetbundles.test.mjs`) re-derives them; the recipe it records would gain the options. Behaviour risk: `legalComments: "none"` drops licence headers of vendored code in the bundle (check `bio-plane/scripts/third-party.json` for the notices that must ship); lowering templates changes tagged templates' `raw` handling only if any exists; comments themselves are read by no code (`minifyWhitespace` renames nothing). The same step applies to the fleet members built by the same recipe. Alternative at the source: ASCII-only comments in the 651 files (each module's own text; a repository check), which does not cover the template/regex characters.
- D / D-ext (the two data texts): `bio-plane/src/case-checker/index.mjs` (`import { programData } from "./program.mjs"`, read by the synchronous `caseCheckerProgramText`) owned by `case-checker`, and `court-citations/index.mjs` (`import { DATA }`, read by the synchronous `load()` behind the proxies) owned by `court-citations`; both readers are synchronous, so on-demand loading makes them asynchronous, an interface change to every caller, and, to move the text out of the script, a delivery change (R2/asset/part) for `bundler` and the installer. `setup-words/rows.mjs` (9 MB of source, held also by `translations`) was not varied here.

**Recommendation.** Do C3 first: one owner (`bundler`), no module changes, 36 MB (86 to 50) measured in the platform's runtime, mechanical and checked by the existing gate; add the escape post-pass to the bundler and keep the full test suite on the bundle before counting it. Do not do D as `import()` (4 MB for an async change in two modules); decide the data-out-of-the-script delivery (19 MB more) only if 78 MB of headroom is not enough, as a BOB decision on how the installer delivers parts.

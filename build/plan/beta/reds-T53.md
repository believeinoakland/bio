# Reds in the suites of U498-U506's modules (BOB #324, 2026-10-27)

**Status** · BOB #324's sort of handoff step 2. Every module below was run twice by `proc tests`, at `e887103327` and again at the tranche tip `6ed95cb038` (after U505-U511 merged). Each red is identical in both runs and was already red at BOB #323's first pass, before U505. So no design or words merge since U505 caused one. Each is an entry for its module's T53 job, `first: settle` whether the test is stale (a K5339/K5343 red, TESTS-SWEEP's run) or the module is wrong, then fix whichever it is (P7, P19; K5006). control-plane's second run was cut off by the session's two-hour limit; its first run is complete. The other 11 modules ran clean.

## case-checker (1 red)
- R2 R8 R19 (G50 control, R-OLD): the verdicts recorded at the G50 base over two stored /3 case files are byte-equal now, g1's original_carried departure included

## control-plane (3 red)
- R100 (csv-reader R26): prose with commas on most lines, uploaded as comma-minutes.txt (text/plain), is read as prose: no cells, no dialect (controls: a real CSV named .txt and the prose declared text/csv are tables)
- R105 (G60): a case whose cited document the case gate finds a problem in passes the pre-flight, is refused at `caseratify` with GATE_REFUSED and its findings, and the ceremony, given that answer, draws the refusal and each finding's check, text and repairs
- R9 seam §5 (K4833, G127c; R120 R123): the same file pressed by a second member is refused for the WHOLE only: `kind: whole` and the holder (red until provenance 21 merges)

## following (1 red)
- R1 C-137.1–C-137.20: following's own family, each row numbered once with its check, its site and its translation; no code of it is held in another module's family (NO_SUCH_ADDRESS re-keyed NO_SUCH_MEETING_ADDRESS, K1836), and followRefusal answers a row's 

## promotion (1 red)
- bio-plane/test/system/row-census.test.mjs

## ratification (2 red)
- R4, R9 (casesign §4): a finding whose own bytes name a case is GATE_REFUSED at op=ratify with C-2.8's case-key arm, and nothing crosses; the same bytes without the key cross
- R4, R9 (multifinding): a finding whose own bytes name a case — its id, edition, scope, acknowledgement and roster — is GATE_REFUSED by C-2.8 naming EVERY key it found, and saying where those facts live; nothing crosses and the case is unmoved

## screens-daily (3 red)
- R46: a search result is a reference of its own kind with its title and a plain excerpt, the match brackets drawn as emphasis; a passage's words when found through one; a hit with no snippet draws its title and kind alone
- R7 (interface-shell R5): every text node each screen draws, with data, empty and failed, is a word (filled) or the record's own data
- R83: a question hit draws the plane's excerpt (its title and conclusion, the match emphasised) and opens the question; a passage hit names its document; control: a document hit is unchanged

## screens-inquiry (10 red)
- R5 R14–R16 R25 R28–R33 R37 R41 each screen draws its requirements' acts, each the registry's, labelled by act.<op>.label.<screen>, each an op OPS holds; the shell serves them
- bio-plane/test/m/screens-inquiry/document.test.mjs
- bio-plane/test/m/screens-inquiry/fr28-document.test.mjs
- R101 the owner's refusals of a change are drawn by their words
- R10 question draws exactly its registry acts: each act the registry lists (the owed ones by their op, R110) is an act of the screen, and the screen has no other; the writing help is drawn only while the assistant is reachable
- R114 pressing Conclude in any state the screen draws either succeeds or names the field that is missing, and no required field is labelled Optional
- R2 state a: its words, two grades and the phrase against the project's bar, weakest part, what would raise it
- R19 the module holds no copy of a words.json word, and none spelled "labelled"
- bio-plane/test/m/screens-inquiry/t51-document.test.mjs
- R44 every key the module's screens read is a words.json word, asserted with hasWord; it holds no row of its own

## screens-intake (1 red)
- R23 a held row's refusal is drawn by its words, never the catalogue's text; a crucial capture is still refused, in words


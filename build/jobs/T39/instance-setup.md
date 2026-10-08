# instance-setup (T39)

**Status** · session_01LAKZqntsHmW1zsfg2HmycE · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · REPORT

B1 read and acted on. Reading set read (requirements whole, K2337/K2343/K2375, draft §2–§4, setup-words' requirements, layer 11's row, setup.mjs's word-list sites, interface-words.test.mjs, the INTERFACE_WORDS sites in translations.test.mjs and store-door/routes.test.mjs); well under 300 KB. Baseline: node --test test/m/instance-setup/ 130 pass, 0 fail. Prepared, not committed: interface-words.test.mjs reduced to R68's share (INTERFACE_WORDS = WORD_ROWS mapped to frozen {key, en, note, means, protected} in order; commit equal; writes throw), no source-text test (JOB rule 5), and the setup.mjs:40–41 re-point with its comment. No question. Waiting on your CHANGE that setup-words has merged.

# T53 R1 · mail-reader · rows

## plan-T53-draft.md

**mail-reader** (new)
- T53 · N1266 (K5435, K5437) · EML, MSG, MBOX; attachments as members; remote content never fetched · `files/REQ-readers-beta.md` ML1-ML6

## plan-T53-capabilities.md

**mail-reader** (FILES', layer 1, place at 14-17: after `ooxml` 13, `structured-text-reader` just before, ahead of `format-registry` 18 and `doc-clean` 30; BOB's)
- Replaces the plan's pointer `ML1-ML6` with `ML1-ML12` (K5466 already put CAPABILITIES' additions A1-A5 into ML7-ML11 and the size split into ML12). Nothing is owed to FILES. N824 adds no parser: `mail-door` and `capture` read headers (`received[]`, `authentication_results`), the four automatic-mail facts, `nesting_depth` and the attachment listing from ML7-ML11; ML12, ML10 and CC5 close the draft's S1-S4. Residual: ML11 returns `{ok:false, reason}` where N824 R10 wrote `refusals[]`: align N824.

## K5629: layer-1 findings folded (BOB #327)

- T53-525 · the other side of T53-524 · `mail-reader` drops its `cfb.mjs` for ooxml's exported reader. Detail: `after T53-524`; test: the MSG fixtures read as before.

# T53 R1 · ooxml · rows

## K5629: layer-1 findings folded (BOB #327)

- T53-524 · mail-reader's report (improvement) · export the MS-CFB reader. Detail: `ooxml` keeps `readCfb` private and `mail-reader` carries its own copy (`bio-plane/src/mail-reader/cfb.mjs`, modelled on it; `bio-plane/test/m/ooxml/cfb.mjs` and `reader-container/test/cfb.mjs` are two further copies in tests). `ooxml` exports one reader with its bounds read from runtime-limits, `mail-reader` imports it (its Uses gains `ooxml`, an edge to a layer-1 module of lower order, if it has none) and `cfb.mjs` goes; the output of `msg.mjs` is unchanged. An improvement, no behaviour change: BOB may place it in "Left out of T53 (P19)" for the next tranche, as the handoff says.

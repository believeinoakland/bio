# intent (T12)

**Status** · session_01Aqw26aHPhWB2gFJysEPTSZ · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings of the Bounds paragraph's N305 sentence (K367). I am building on both readings now and will not stop for the answer.

1. `proposals` with no project "reads at most the first 1,000 projects in id order". My reading: the first 1,000 projects **the viewer may see**, in id order, so `projects_truncated` never tells a viewer that projects hidden from them exist (R23; DEC-36's "no count"). The cost is that each hidden project is skipped with one `inSight` check, which is not counted. The other reading is every project whatever the viewer sees. That bounds the walk strictly, but a viewer who sees 3 projects could then read `projects_truncated: true`.
2. R28 reads "the first 1,000 conditioned projects". As worded, finding them walks project documents until the 1,001st conditioned one turns up. When few projects state a condition, that walk is still bounded only by the number of projects held. I am building it as worded. If you want the walk itself bounded, the wording would be "of the first 1,000 projects in id order, those with a condition", like (1).

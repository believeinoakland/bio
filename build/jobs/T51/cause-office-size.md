# cause-office-size (T51)

**Status** · session_01SpRHCwf2dQB77nUBTDACXY · depth 2 · WORKING · handled B0

## J1 · QUESTION

Q1 (F7, ODF and UTF-16 csv). Best reading and what I will build unless you say otherwise: docx, pptx, xlsx and csv text parts over 20 MiB are read in bounded pieces (streaming inflate, incremental walkers, cells not listed over the bound and stated), up to a streamed ceiling I will set from measurement (starting point: the 64 MiB COFF-6 named). For ODF I propose the fallback R35 already allows: content.xml over the bound is stated with its size, final, not read in pieces. Why: odf.mjs holds content.xml as one string that about fifteen walks slice and re-walk (officeBody, walkTextBody, walkSheet, walkPage, stripElement, ...), so reading it in pieces is a rewrite of the 2,400-line reader; and R45's own bound (ODF_REPEAT_EXPANSION_MAX 262,144 units) already stops an .ods at about 20 MiB whatever I do; COFF-6 measured zero native ODF, and a Drive export of a Doc is under a few MB. Same fallback for a csv in UTF-16 over the bound (the fatal decode needs the whole body). Is R35 amended so that odf (and UTF-16 csv) over the bound is stated with size, final? If you want ODF read in pieces I will build it; tell me and I carry on in the meantime with the other four.

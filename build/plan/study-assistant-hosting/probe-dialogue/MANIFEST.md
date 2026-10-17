# Probe dialogue (K3601)

- `probe-text.txt`: 211182 bytes, sha256 `cd1de8a77bf949de7fa48768a59c8caf4d4396d09ff674638a73a7a8cc5780c8`, 1975 lines. Rule: 3 header lines (line 3 plants `ORCHID-319`), filler lines `L<i:04d> the quick brown fox ... n<i:04d>` for i = 1..1970, then the last-planted line (`QUARTZ-857`) and `END OF PROBE TEXT.`
- Expected answer file `probe-answer.txt` (written by the probe session; expected here as `expected-answer.txt`): 61950 bytes, sha256 `5a70f297fcd0afe2416cd4b90282939b0a8cefb64c205c923db4b889150b4f23`; rule: for k = 1..1050 one line `R<k:05d> the five boxing wizards jump quickly; digest m<k:05d>`, first preceded by nothing, no other lines.
- Expected facts: first code word ORCHID-319, second QUARTZ-857, sum of their numbers 1176.

# file-safety (T47)

**Status** · session_01SVm2D1MtCDCXBehFW6dBUB · depth 2 · WORKING · handled B0

## J1 · QUESTION

Four readings I am building on; each is my best reading, so I carry on unless you say otherwise.

1. **R42a reaches two more rows.** "every text a member reads from this module" also covers C-140.3 SCANNER_UNREACHABLE ("The virus scanner your group's Civicsmith uses did not answer …") and C-140.38 SAFE_COPY_WITHHELD ("… found clean by the virus scanner …"). I re-word both to "file scanner", codes, numbers and `where`s unmoved. That widens the accepted row-census red from 2 rows (C-140.2, C-140.13) to 4 (plus C-140.3, C-140.38), on top of the new C-140.43, all for T48's stamp.
2. **R43, a fault after the queue was read.** `renderBatch` reads both queues (views and safe copies) before rendering anything, inside region `is-render-queue-readable`; an unreadable queue answers RENDER_QUEUE_UNREADABLE with no counts. A fault after rendering has begun (say, the bucket refusing a write) can no longer answer RENDERER_ABSENT (R43). It answers RENDER_QUEUE_UNREADABLE with `rendered` and `copies_made` as numbers (what was done), "the rest wait for the next round", as R36's second catch does for DEEPER_CHECKS_UNREADABLE.
3. **R39's render wake while the queue cannot be read.** Today `renderWake` answers null when its own read throws, so nothing wakes `renderBatch` again and C-140.43's "read again on the next round" would not hold. Following R39's deeper rule, it answers the last `renderBatch` plus FILE_SAFETY_POLL_MS (never before now) while the last batch found the queue unreadable or the wake's own read fails; still null with no renderer bound. If you want this in R39's text, it is a one-clause amendment: "and the last `renderBatch` plus `FILE_SAFETY_POLL_MS` while its queue cannot be read".
4. **R44, "begins 'the organization'".** I read this as the whole words: "the organization", "the organization's own …" are true; "the organizational partner's cloud" is false. Code today uses a word boundary (`/^the organization\b/i`), and I keep it. If you mean a literal prefix, say so and I change it.

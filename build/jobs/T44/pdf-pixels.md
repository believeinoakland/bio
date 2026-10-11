# pdf-pixels (T44)

**Status** · session_01HryQFWAv5MrBMYBBygXxEJ · depth 2 · WORKING · handled B2

## J1 · QUESTION

Readings I am building on; I carry on with them unless you answer otherwise. None blocks me.
1. **R11's strip, as I consume it** (image-codecs is not published yet, so I build against the interface R11 states): `onRows(rows, y0, count)` hands a `Uint8Array` of `count` rows, each `width × comps` bytes, interleaved exactly as R1's `samples` (`rotate: 0`), `y0` the first row's index in the unrotated frame; `rows` may be reused by the decoder after `onRows` returns (I copy nothing out of it beyond the row sums). The width, height and comps I read from `readJpegHeader` before the call. If image-codecs publishes a different shape, I adapt to it.
2. **`PICTURE_FRAME_MAX` on the reduced frame** counts `ceil(width/k) × ceil(height/k) × components` with the header's components (3 for a colour JPEG even when `grey`), the literal reading; it can only refuse more, never less, than the output grey frame needs. With the plane's `maxEdge` 1568 it is never reached.
3. **`PICTURE_SOURCE_MAX`'s yardstick.** Decoded strip-wise, memory no longer grows with the frame beyond the input bytes and one MCU row, so the bound is set by CPU time: I measure ms per megapixel for the 48 MP decode and set the bound so the largest admitted frame stays well inside the Workers paid default of 30 s CPU per invocation (no `cpu_ms` is set in `bio-plane/wrangler.jsonc`), with the input bytes and the plane object's own share counted against the 128 MB. The figure and its margin go in my record.
4. **Partial edge boxes under 5–8** (draft doubt 4): each source axis gets its own box map, reversed where the orientation reverses it, so a partial box falls on the source edge that Pillow's oriented right/bottom edge comes from; the 6 and 8 tests pin it, and 2, 4, 5, 7 are pinned by the existing small variants run through the new path.

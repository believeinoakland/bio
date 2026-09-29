# control-plane (T12)

**Status** · session_01UDmj5HcYEvNNWTxaQkjZLn · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q1. The forward's versionchain stamp normalises `address` with subresources' `normalizeAddress` (index.mjs 5826, moved with the forward). control-plane's uses lack `subresources` (layer 1, no cycle), so architecture fails once. My best reading: add the edge `control-plane` → `subresources`; I import it meanwhile. (Also for your review at close: ownership lists two added legacy-index lines it cannot pair with an import, the headers of `publicOp`/`gatedOp`, the functions that now hold legacy-index's remaining arms for `makeFetch`; the arm bodies are unchanged lines.)

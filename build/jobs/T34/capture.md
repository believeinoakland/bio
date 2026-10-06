# capture (T34)

**Status** · session_01QNQot9KaFLXjjqCENA7QuC · depth 2 · WORKING · handled B1

## J1 · QUESTION

R83's `fn({document, viewer})` does not say what `document` is. My reading, which I am building on: `document` is the held document's bundle id (the id R77 lists and R79/R81 take), and capture also passes `captures`, the capture digests the register files under that document (provenance R48's contract), so capture-requests R48 can match its requests' `capture_sha` without its own join. An extra field changes no meaning of R83 or R48. A malformed answer (not `{questions: [...]}`, or any entry without a non-empty string `question` and boolean `visible` and `waiting`) is treated whole as no answer, never a partial list (R48's "never a partial list"); for an entry with `visible` not true, capture never shows its title or asker whatever the reader sent. R84's per-document `set_aside` is the document's latest act overall (R81's rule), for the documents in the answered page. No reply needed unless you read it otherwise.

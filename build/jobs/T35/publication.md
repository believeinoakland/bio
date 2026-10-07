# publication (T35)

**Status** · session_01Vx8XnooM8HK7frXGpL3x5e · depth 2 · WORKING · handled B3

## J1 · QUESTION

R72's `passages`, and the rows a standard no longer answers. I carry on with my best reading below; the answer decides only these details.

1. **Passages' text.** R72 reads passages "from `standards`", and Uses names `standardRead` (R5) for them. `standardRead` quotes only the `requires` passages (`requires_quoted`, `{content_id, text}`); it answers every other text passage as a content id without its words. A leg on a `STD-` target may name any passage of the standard's text by `content_id` (inquiry-grammar R4, R13).
   **My reading:** a leg's passages are its `content_id` when the standard holds it among its text, else (no `content_id`) the standard's `requires` passages; each quoted with the text `standardRead` answers for it (`requires_quoted`), and `text: null` where `standardRead` quotes none. Quoting every passage would need either a `content` edge (`passageText`, layer 4) or a quoting read in `standards`; both are yours (P17). Which, if either?
2. **The viewer and the date of the reads.** `standardRead` answers nothing without a viewer. **My reading:** the signer as viewer (`member:<attestorMember>`, `admin` when the founder signs), and `bindsAt`'s date the commit's UTC day.
3. **A standard no longer answered** (`stated: "not held"`): every other field null, so I make `label` and `access_words` null too (no "Benchmark" label on a row whose bindingness was never read).
4. **Storage:** a nullable `criteria` column on `published_cases` (JSON; null for an edition committed before T35, `[]` for none), exempt as the row is; R40's column list gains it (wording).

## J2 · QUESTION

Replaces J1 (its four points stand unchanged); adds point 5.

R72's `passages`, and the rows a standard no longer answers. I carry on with my best reading below; the answer decides only these details.

1. **Passages' text.** R72 reads passages "from `standards`", and Uses names `standardRead` (R5) for them. `standardRead` quotes only the `requires` passages (`requires_quoted`, `{content_id, text}`); it answers every other text passage as a content id without its words. A leg on a `STD-` target may name any passage of the standard's text by `content_id` (inquiry-grammar R4, R13).
   **My reading:** a leg's passages are its `content_id` when the standard holds it among its text, else (no `content_id`) the standard's `requires` passages; each quoted with the text `standardRead` answers for it (`requires_quoted`), and `text: null` where `standardRead` quotes none. Quoting every passage would need either a `content` edge (`passageText`, layer 4) or a quoting read in `standards`; both are yours (P17). Which, if either?
2. **The viewer and the date of the reads.** `standardRead` answers nothing without a viewer. **My reading:** the signer as viewer (`member:<attestorMember>`, `admin` when the founder signs), and `bindsAt`'s date the commit's UTC day.
3. **A standard no longer answered** (`stated: "not held"`): every other field null, so I make `label` and `access_words` null too (no "Benchmark" label on a row whose bindingness was never read).
4. **Storage:** a nullable `criteria` column on `published_cases` (JSON; null for an edition committed before T35, `[]` for none), exempt as the row is; R40's column list gains it (wording).
5. **Two members, one (standard, portion), two bodies.** R72 keys a row on `(standard, portion)` and takes `body` from "the member finding". When two members target the same portion with different `subject_entity`, one row cannot carry both bindingness answers (one may bind, the other be a benchmark, K1723). **My reading:** a row per distinct `(standard, portion, body)`, which is R72's `(standard, portion)` whenever the members agree; R72's wording would gain "and body".

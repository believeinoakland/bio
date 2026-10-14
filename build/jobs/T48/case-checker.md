# case-checker (T48)

**Status** · session_018WMMFUHbJM9RyU5qyFkQ6N · depth 2 · WORKING · handled B3

## J1 · QUESTION

R25 asks the program to be read "on the first read of `PROGRAM`, `PROGRAM_SHA256` or `PROGRAM_BODY_SHA256`". Those three are exported strings, and a string export cannot be read lazily (a primitive has no proxy form, unlike court-citations' arrays). No module outside case-checker reads them: the `casechecker` read goes through `caseCheckerProgram()`, and only my own tests read the three names.

My best reading, which I am building now: `program.mjs` (generated) holds the program as one JSON text `{sha256, body_sha256, text}` returned from inside a function, so evaluating the module builds no program text. `index.mjs` replaces the three constants with one accessor, `caseCheckerProgramText()`, which parses that JSON on its first call, freezes it, and returns the same object after that. `caseCheckerProgram()` (R15's read) reads through it. The served bytes and SHA-256s stay unchanged.

R25's "first read of PROGRAM, PROGRAM_SHA256 or PROGRAM_BODY_SHA256" would then read as "the first call of that accessor", and R1/R13 say nothing about the three names. Please confirm, or name the form you want; the requirement's wording is yours to amend.

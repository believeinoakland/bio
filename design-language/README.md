# design-language/: BIO's design language, recovered from Claude Design

## What is here

- **`CivicOS-Design-Language.reference.html`** is the design reference from Bob's Claude Design project,
  *CivicOS Design Language* (turn 1 of 5, "proofs, not screens").
  - It is saved byte for byte from the artifact https://claude.ai/artifact/BZNnVH77iZ9wESXbf7Xbip
    (version 1790289339-4d76) on 2026-09-24.
  - It is a self-unpacking bundle: a React page, plus the Source Serif 4, Source Sans 3 and Source Code
    Pro faces as WOFF2.
  - Its sections are **01 Tokens**, **02 The two spaces** and **03 Open item**.
  - Open it in a browser to see it.

## Checked

- All 18 color tokens in the reference (name and value) are **identical** to `civicos-ui/tokens.css`
  on `bio` `main` at `1a7f0bc`. `bio`'s copy has not drifted from the design.

## Still missing: the handoff bundle's text

The Claude Design session's handoff bundle holds three things this reference does not:

- `README.md`: the self-sufficient spec, including the three open decisions marked *do not resolve in
  code*, and the three values derived beyond the brief (`--ink-soft`, `--sheet`, `--rule-strong`).
- The two source documents, including `BIO_Design_Language_v0_2.md`, which `tokens.css` cites as its
  source of truth.
- `tokens.css` as it was handed off.

None of these is in `bio`. They belong here when the bundle arrives.

## Also noted

`bio` contains no WOFF2 files, although `tokens.css` loads its faces from `/fonts/`. The faces are
embedded in the reference above.

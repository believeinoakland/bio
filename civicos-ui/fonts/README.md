# fonts/: the app's typefaces, served from its own origin

These are the faces `tokens.css` declares. The `civicos` worker serves them at `/fonts/`, so the app
never asks another origin for a face. A sovereign install must render offline.

| file | face | axes | source file |
| --- | --- | --- | --- |
| `source-serif-4-var.woff2` | Source Serif 4, roman | wght 200–900, opsz 8–60 | `source-serif-4-latin-opsz-normal.woff2` |
| `source-serif-4-italic-var.woff2` | Source Serif 4, italic | wght 200–900, opsz 8–60 | `source-serif-4-latin-opsz-italic.woff2` |
| `source-sans-3-var.woff2` | Source Sans 3 | wght 200–900 | `source-sans-3-latin-wght-normal.woff2` |
| `source-code-pro-var.woff2` | Source Code Pro | wght 200–900 | `source-code-pro-latin-wght-normal.woff2` |

## Where the files came from

- Taken unchanged from the npm packages `@fontsource-variable/source-serif-4`, `source-sans-3` and
  `source-code-pro` at 5.3.0, on 2026-09-24.
- They are the **latin** subsets. Glyphs outside latin fall back to the system faces in `tokens.css`'s
  stacks.
- The copyright is Adobe's, as each file's own name table states: "© 2014 - 2021 Adobe Systems
  Incorporated" (Serif) and "© 2023 Adobe" (Sans, Code Pro), "with Reserved Font Name 'Source'".
- The faces are licensed under the SIL Open Font License 1.1. Each `OFL-<family>.txt` is the package's
  licence file, unchanged; its first line is the packager's header, not the copyright holder.

## sha256

```
f2ea9c12d2fe9bd3a9589b02ad2c0909da88f30938c91adc838c4f4098f9f9e0  source-serif-4-var.woff2
96e6393209728ab93c334ae739af8a040cd2006c82e8614d6465a8084db88f89  source-serif-4-italic-var.woff2
7a19a7027e125257d310c6dbd78ae3a30b5ea1e3794d60b12bb28227a003bfda  source-sans-3-var.woff2
8b774aaa5137a38ef40f4ac9d36db9a5eee152b2f66589dfdc82ff007fc87135  source-code-pro-var.woff2
```

Tested by `test/self-hosted-fonts.test.mjs`, with its negative control `test/self-hosted-fonts.control.mjs`.

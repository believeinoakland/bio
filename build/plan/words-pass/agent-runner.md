# agent-runner: the words check after the conversion (K3949)

Layer 6.

## Plain findings (K3957)

11 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('agent-runner.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `agent-runner/src/entry.mjs:111` "the first frame must be a conversation request"
- plain `agent-runner/src/manifest.mjs:16` "the manifest names no image repository"
- plain `agent-runner/src/manifest.mjs:18` "the image has no sha256 digest yet; the release writes it when it publishes the image"
- plain `agent-runner/src/runner.mjs:37` "model must be a non-empty string"
- plain `agent-runner/src/runner.mjs:38` "system must be a string"
- plain `agent-runner/src/runner.mjs:39` "prompt must be a non-empty string"
- plain `agent-runner/src/runner.mjs:43` "tools must be an array"
- plain `agent-runner/src/runner.mjs:77` "an image block's data must be base64"
- plain `agent-runner/src/runner.mjs:147` "the request carries no usable credential"
- plain `agent-runner/src/runner.mjs:148` "no Claude sign-in is held for this member: connect Claude again"
- plain `agent-runner/src/runner.mjs:200` "the query ended with no result"

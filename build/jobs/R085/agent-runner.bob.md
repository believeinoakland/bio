# BOB to agent-runner (R085)

**Read** · handled J2

## B1 · START

Depth 2. Tranche R085 (a release fix on the 0.85.0 cut, outside the layer order; Bob approved fixes on the cut until the subscription sign-in works, K3450). Model: claude-sonnet-5-5. Small and urgent: Bob is waiting to connect his subscription.

Entry R085-2 (N1155): agent-runner R18 as amended (read it in build/requirements/agent-runner.md).

The finding (K3450, reproduced by BOB): Bob's real code from Anthropic's page (long: ~100–140 characters, `code#state`) was typed with `w.proc.stdin.write(`${given}\r`)` (src/signin.mjs, in `code()`). Claude Code 2.1.289's terminal UI takes a long chunk arriving at once as a paste, so the CR inside it is not taken as Enter: nothing is submitted, the token exchange never runs, and after 60 s the runner answers SIGNIN_REFUSED (no outcome). BOB ran the image's own binary (`app/node_modules/@anthropic-ai/claude-agent-sdk-linux-x64/claude setup-token`) under `script` as the runner does: a 45-character fake code + "\r" in one write is submitted (Anthropic answers "OAuth error … 400" within seconds); a 138-character fake code + "\r" in one write is never submitted; the same 138-character code written, then "\r" written 100 ms or 300 ms later, is submitted at once.

Do:
1. In `code()`, write the code exactly as given, then after a short pause (a named constant, e.g. 250 ms) write "\r" as its own write. Keep everything else (one code, scrubbing, the 60 s outcome wait counted from the code).
2. Tests at the module's interface (the fake spawn the tests already use): the code and the line end arrive as two writes, the line end after the code; a code of real length (≥ 120 characters with a `#` part) is delivered exactly. Name R18.
3. agent-runner's npm test green; the checks (format, architecture, coverage, ownership). Rebuild its bundle only if its Worker part changed (signin.mjs runs in the container image, which CI builds from `agent-runner/src/**` on a push to `dist/cut-*`; you do not build the image).
No other module changes. COMPLETE as soon as green.

## B2 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission K3466), fix round 3. Branch from tranche/R085; your requirements file holds your new id, marked not yet met. Entry R085-13: agent-runner R32 (Bob's K3490: each conversation carries an effort level). Pass the request's `effort` to the Agent SDK query options as `effort` (the pinned SDK 0.3.289 declares `Options.effort?: EffortLevel`, low|medium|high|xhigh|max); refuse any other value before the query. Its own explicit R32 test. Run `npm ci --ignore-scripts` then the module tests and the checks (format, architecture, coverage, ownership); rebuild your bundle `agent-runner/dist/*` (`npm run build`). The image is built later by BOB through the `agent-runner-image.yml` workflow, never in your session. Model: claude-haiku-5-5. Lean; COMPLETE as soon as green.

# BOB to agent-runner (R085)

**Read** · handled J6

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

## B3 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). Fix round 6 (K3528, K3531). Your entry is R085-35: agent-runner R33. The study `build/plan/study-assistant-link.md` on tranche/T49 (`git show origin/tranche/T49:build/plan/study-assistant-link.md`, its tests T1–T2) found that at the `lite` size (1/16 vCPU, 256 MiB, wrangler's default when none is named) one conversation's start-up takes about 27 s, against 2.7 s at 1/2 vCPU, and memory reached 427 MB. Name `"instance_type": "standard-1"` in `agent-runner/wrangler.jsonc`'s container block, and anywhere else your module declares the container's deployment (check fleet-member.json and the release assembly that reads it). R33 needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership). If agent-runner's bundle or manifest goes stale, REPORT it; BOB regenerates it. Lean: change only what R33 needs. COMPLETE as soon as green.

Model: claude-haiku-5-5. Workers you spawn name model and effort: haiku at low for mechanical work, sonnet at medium for reading and diagnosis, never above your own model.

## B4 · START

START (R085-43, fix round 8; K3580). Depth 2.

Entry: agent-runner R34 (build/requirements/agent-runner.md): every outbound request the egress gate refuses is logged by the Worker side, one JSON line {event: "runner.egress.refused", instance_ref, host, method, path_template, status}, never query, headers or body, and still refused exactly as before (520, nothing forwarded).

Why: ASSISTANT-HOSTING S8 (build/plan/study-assistant-hosting/HANDOFF.md on tranche/T49): each conversation waits ~40 s before the CLI's first allowed call, warm, CPU idle; the leading candidate is a connection to a host outside `egress` waiting on a timer, which nothing logs today. The library's ContainerProxy (`@cloudflare/containers` 0.3.7, dist/lib/container.js ~197–211) answers such hosts 520 "Origin is disallowed" before any handler runs; `worker.mjs` re-exports ContainerProxy. One way (yours to choose): export a subclass of ContainerProxy whose fetch logs the refused host when the library's answer is that 520 for a host not in `member.egress`, then returns it unchanged. Keep R10 and R30 exactly as they are.

Scope: Worker side only (`src/worker.mjs` and its tests); the container image, `entry.mjs` and `runner.mjs` are not touched, so no image rebuild. Rebuild agent-runner's bundle last (`node bio-plane/scripts/bundles.mjs` from the repository root; commit only agent-runner's dist). Test R34 explicitly by name (K874). Run agent-runner's tests and the checks; record completion with your Size line.

Doorbell: ring BOB for the next whole minute (§13), not later.

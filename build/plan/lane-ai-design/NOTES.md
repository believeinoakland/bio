# AI-DESIGN notes (sources read, quoted)

Newest section last. Quotes are from the files named; R-ids are each module's own. Documents were read whole by the lane or by sonnet-medium workers told to read whole (K3588); the workers' reports are summarised here, not copied.

## Q1 · What exists (read 2026-10-17)

### Sources read whole
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` (lane, whole).
- `build/requirements/`: `agent-runner`, `agent-harness`, `agent-worker`, `agent-model`, `ai-accounts`, `ai-use`, `ai-runs`, `credentials` (workers, whole).
- `build/rulings-active.md` (worker, whole; §1 and §3 are the focus).
- Not read, named as the next reads: `build/terms/anthropic.md`, `words.json` (member-facing sentences may say "Anthropic"/"Claude"), `ASSISTANT-PILOT.md`, `INVESTIGATIVE-SESSION.md`, `build/rulings.md` for D14's AI bar text (**not stated in `rulings-active.md`**; it appears only as "D14's AI bar" with the test-instance exception, line 26).

### What the canon fixes (provider-independent by its own words)
- Canon §1: "the construct is, above all, a set of BOUNDARIES that hold regardless of which model, prompt or vendor sits behind them." The assistant "introduces NO NEW TRUST BOUNDARY" (DEC-27); "THE LINE IS AUTHORSHIP, NOT WRITING".
- Four roles FIND / PURSUE / EXTRACT / CHECK (DEC-24); rules §3.1–12 (machine proposes, member authors; labelled as machine work; no machine credential performs an attested act; an AI never travels on a member's token; endpoint surface is the fence; refusals carry the plane's own label; what it reads vs. what enters the record).
- The canon says of the cascade (§6): "Which Claude account a run travels on is a cascade — member → project → instance", re-ruled K2352/K2353: "for a member's act, the project's account if it has one, with the project's limits; else the member's own, with the member's limits; else the group's, with the group's limits; ... one at its limit, or with that use switched off, refuses rather than passing the act on."
- Canon §8: the assistant's flow, wizard, prompt entry point, FIND end to end are DESIGNED (`ASSISTANT-PILOT.md`), not built; the investigative session (run object, bounds, log, checks) is built.

### Rulings in force (`rulings-active.md`)
- K3717/K3718: no Anthropic AI in the new direction; assistant not disabled; "Just don't put any more effort into getting it to work"; K3718(5): K3347's bar "read as about the Anthropic assistant it was ruled for; how each other AI is reached is the lane's to explore."
- Cascade (line 74): K1755/K1757/K1547/K2352/K2353/K3347; K2892 "A member's own sign-in runs check and plan for that member only".
- K3602 Choice A (line 70): "a member sees the assistant's progress (what it is reading, composing, checking) as it happens, and its answer only after Civicsmith's check; never unchecked words."
- K3061/K3060 (line 27): token held until revoked/dropped is allowed; "never raise U-2 or U-7 again" (Anthropic-specific).
- K1881 (line 18): protective limits added without asking; "a limit that changes what a member or group may do is Bob's."
- K1880 (line 71): reading public sites vs. record capture. K3472: "'team', never 'group', in any text people read, from T50" (code and requirements still say group).
- K3538/K3558/K3574: study method: every viable option understood and tested, bottom-up, "just trying to understand, measure, test".
- K2425/K3540: a terms point is raised only if confirmed from the latest provider text; an open point is not a problem until shown to be.

### Provider-NEUTRAL today
| What | Where |
|---|---|
| Control-flow tables, gate-mode, pass/stop rules, judgement fence, report shape/checks, plan flow, spawn contract | `agent-harness` R1–R16, R18–R19 (harness "names nothing of a vendor"; only R17 `remoteBrief` is conditional) |
| Worker loop: fanout/collect/compose/dedup/submit/adjust/close, bounds, no-model-sets-bounds, plane-side shape checks, tool allow-lists (`PLANE_OPS`, `ASK_OPS`), record text only in tool results, refusals never reworded, run log shape | `agent-worker` R1–R5, R7–R12, R17–R27, R37–R39, R43, R49–R55, R60–R63, R94–R105, R113–R118 |
| Run object, bounds (`fetches, subsessions, wallclock, runtime, mints, surfaces, proposals, lease`), one exit, lease/reap/wake, run log, mode admission, surfacing | `ai-runs` R9–R17, R24–R29, R31–R32, R40–R47, R77–R78, R81–R89 |
| Agent credential base (`organisation`/`member`, task scope, hash-only storage, expiry), run credential, ask/standing grants, keyed services | `credentials` R12–R15, R27–R29, R31–R32, R42, R53, R63 |
| Account cascade shape (project→member→group, first held-and-on is the one used, off ⇒ refuse never fall through), per-use switches (nine `USE_KINDS`), who may set, material limits (keep-away), disclosure-before-first-paid-act ordering, change history, sealing (AES-256-GCM, never exported) | `ai-accounts` R2–R4, R6–R7, R9–R17, R20–R34 |
| Usage counting, limits `{owner, scope, unit usd/tokens/calls, period}`, `useCheck` refuses at limit (fail closed), estimates, per-model/effort recording, explore gates | `ai-use` R1–R15 |
| Relay idea (the model's tool calls travel to the Worker, whose table decides every call) | `agent-runner` R3; `agent-model` R6–R7 |
| Run/log/trace/egress logging shapes | `agent-runner` R29–R31, R34, R39 |

### Tied to Anthropic today
| What | Where |
|---|---|
| Model call: Messages API at one `MODEL_ENDPOINT`, `x-api-key`, `cache_control`, `output_config.effort`, `stop_reason:"refusal"`, 429 `enforced_spend_limit_reached`, `search_result`/`image` block shapes, usage fields (`cache_read_input_tokens`, `cache_creation_input_tokens`, `total_cost_usd`) | `agent-model` R2–R5, R12, R14–R15, R19, R21; `ai-runs` R72 |
| Model ids and prices in requirements: `claude-opus-5-5`, `claude-sonnet-5-5`, Anthropic's published rates; `MODEL_FOR_MODE` | `agent-model` R1, R13, R19; `agent-worker` R98; `ai-runs` R88; `ai-use` R15 |
| Claude Code runner: unmodified Agent SDK in a container, built-in tools off, egress to Anthropic hosts only; sign-in via the binary (`claude setup-token`, OAuth code, `CLAUDE_CODE_OAUTH_TOKEN`) | `agent-runner` R1–R2, R4, R10, R16–R22, R27–R28, R30, R32–R33; terms gates R22–R23 |
| The remote route (a Claude Code cloud session reached through a tool door), unbuilt/conditional, "until the remote path works on a copy, that copy's assistant does not run" (K3610) | `agent-runner` R36–R40; `agent-worker` R109–R111 (R111 "not yet met: T50"); `agent-harness` R17 |
| Account kinds `apikey` and `signin` only; `subscription` retired. Group/project key "an Anthropic API key"; member's "Claude subscription"; subscription token 20–2000 chars; "Claude is today's only provider" | `ai-accounts` R1, R5, R7, R10, R18–R19; `agent-model` R2, R11; `agent-worker` R6, R32 |
| Member-facing notices naming Anthropic ("go to Anthropic under that account", D311) and refusal wording "connect their Claude account again" | `ai-accounts` R8, R12; `agent-worker` R82; `credentials` R66, R73 |
| Terms register and rules (AT-n, U-n; K3061 settled U-2/U-7) | `build/terms/anthropic.md`; rulings lines 27, 30 |

### Mixed (neutral idea, Anthropic-shaped content) — the design's real work
1. **Account `kind`**: `apikey`/`signin` mean "Anthropic API key"/"Claude sign-in"; no requirement has a place for a **provider id**, a per-provider endpoint, or per-provider connection flow (`agent-model` R10 assumes one `MODEL_ENDPOINT`).
2. **`usage` shape** inherited from the Messages API: cache fields and `total_cost_usd` may not exist for other providers; `null`-not-zero (`agent-model` R5) and `estimated_cost_usd` null-priced-at-highest-rate (R13) are the neutral hooks.
3. **Units**: `ai-use` R2/R10 say a sign-in has no `usd` ("`LIMIT_UNIT_UNAVAILABLE`") — ties the unit rule to account kind rather than to "does the provider report cost".
4. **`effort`** (`low…max`, `output_config.effort`) assumes every AI has such a dial.
5. **Tool use / relay**: harness and worker assume a model that calls tools by name with structured results; `agent-runner` R3 does it via in-process MCP tools; `remoteBrief` assumes an HTTP tool door. An AI without tool use fits only a degraded path.
6. **Image transcription and `read`** (`USE_KINDS` `transcribe`, `read`) assume image input.
7. **Disclosure** (D311): mechanism neutral (once, before first paid act); text names Anthropic.
8. **Run-credential revocation** on "sign-in cleared" (`credentials` R63/R73) presumes a per-member sign-in lifecycle.
9. **Group vs team wording**: K3472 says "team" in text people read; K3717 says "a team's, a project's, and a member's choosing"; code and requirements still say group.
10. **Where it runs**: `agent-worker` is a Cloudflare Worker with ~4,077 source lines, past the 4,000 limit (split is N1205); `agent-model` calls out from the Worker; the container route (`standard-1`) is Anthropic's.

### Bookkeeping found
- R35/R30 vs R109/R110 in `agent-worker` disagree until R35 is reworded (RUNNER vs REMOTE).
- Stale text: `agent-worker` R98 and `ai-runs` R88 hard-code Claude model ids in requirement text.
- `rulings-active.md` does not state D14's AI bar (read it in `build/rulings.md`/requirements before Q3's cascade is designed).
- Unbuilt/accepted-red by K3718(2): agent-runner R36–R38, R40; agent-worker R111; agent-harness R17; screens-settings R41; installer R56, R58; journey-check R19 (not re-verified here).

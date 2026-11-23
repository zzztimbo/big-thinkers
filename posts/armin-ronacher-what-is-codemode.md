# What is Codemode

- **Thinker:** [Armin Ronacher](../people/armin-ronacher.md)
- **URL:** https://lucumr.pocoo.org/2026/10/6/codemode/
- **Platform / Format:** `blog` (`essay`)
- **Published:** 2026-10-06
- **Track:** `ai-agents`
- **Signal Score:** 96/100
- **Status:** `queued`

## Core Thesis
Bash and CLIs remain the best interface inside the target **execution environment ("the hands")**, while **Codemode** (a sandboxed, no-I/O JavaScript runtime inside the agent harness) is the right way to orchestrate **harness-side ("brain")** capabilities—multimodal payloads, System-1 classifiers, subagents, and progressive MCP discovery—without flooding the LLM's context window.

## What They're Teaching (Key Ideas)

1. **Brains vs. Hands (Harness Host vs. Execution Environment)**
   - **The Brain (Harness):** Runs on a trusted host, owns the LLM conversation loop, credentials, model SDKs, subagent orchestration, and multimodal protocol injection (`image()`).
   - **The Hands (Execution Environment):** Often sandboxed or remote (e.g., Gondolin, containers, VMs) where `bash` and CLI programs mutate a target filesystem.
   - Bash can only compose *programs running in the target environment*; it cannot cleanly inject raw image blocks into the LLM protocol or orchestrate harness-internal model APIs.

2. **How Codemode Works Under the Hood**
   - In Pi 1.0, Codemode runs JavaScript inside **QuickJS compiled to WebAssembly** with deliberate hard limits: **no network, no filesystem, no timers, capped RAM**—its *only* side effect is invoking exposed harness/MCP tools and returning a filtered summary.
   - *(Direct parallel: OpenCode's `execute` tool + `search(...)` progressive catalog works the exact same way!)*

3. **Keep Bulk Data Out of the LLM Context Window ("Probe 5, Process N")**
   - A standard `bash` tool call truncates output (e.g., 2,000 lines) and forces every intermediate step through expensive LLM turns.
   - In Codemode, the agent receives full structured JSON, runs `Promise.all` / `Promise.allSettled` fan-out (throttled by the harness's concurrency queue), stashes raw state in the session transcript via `store("key", data)`, and returns only the distilled 10-line answer to the model.

4. **Exposing Non-Tool SDK Primitives (Image Gen & System-1 Classifiers like Jev)**
   - Capabilities like one-shot structured classification (`models.classify(jev, ...)`) or image generation (`models.generateImages(...)`) waste context if exposed as permanent top-level tool schemas.
   - Inside Codemode, an agent can pull 100 GitHub issues via `gh`, run Jev across all 100 in parallel to score frustration/sentiment/bug-type for pennies, persist the full table with `store()`, and surface only the 12 most frustrated bugs.

5. **Why MCP Needs Progressive Discovery & Honest Schemas (Not Nested Codemode)**
   - Hiding MCP tools behind in-Codemode `search()` makes large MCP servers viable without upfront schema tax (what Geoffrey Huntley calls *"allocations on the dance floor"*).
   - **Anti-pattern ("Codemode in Codemode"):** Servers like Cloudflare's MCP that embed their *own* `execute({ code: "..." })` force the model to double-escape JS-inside-JS and block inner code from calling outer harness tools.
   - **4 rules for Codemode-friendly MCP servers:**
     1. Return real JSON via `outputSchema` (`structuredContent`), not prose.
     2. Return **consistent shapes** regardless of batch size (adaptive "token-optimized" schemas break the probe-5-then-run-100 pattern!).
     3. Better out-of-band / binary payload handling (still a gap in MCP today).
     4. Cross-server composable tool search.

6. **Open Problem: Durability**
   - If a long Codemode script fails halfway through 50 tool calls, re-running from scratch is wasteful or unsafe. Armin points toward **durable workflow snapshotting** or deterministic languages like **Starlark** as the next frontier.

## Connections & Debates Across Thinkers

- **[Mario Zechner](../people/mario-zechner.md) & [Chris Riccomini](../people/chris-riccomini.md):** Both pushed back hard on naive MCP server sprawl (*MCP vs CLI*, *This MCP Server Could Have Been a JSON File*). Armin shows Codemode isn't a retreat from "Code Is All You Need"—it brings code composition *to* MCP and the harness layer while leaving CLIs in charge of the target OS.
- **[Geoffrey Huntley](../people/geoffrey-huntley.md):** Directly solves Geoff's *"too many MCP allocations on the dance floor"* critique by keeping MCP schemas at zero tokens until searched inside Codemode.
- **[IndyDevDan](../people/indydevdan.md):** Armin's `gh issue list` -> `Jev` classifier -> `store()` example is a textbook implementation of Dan's *10 Levels of Jev* (putting a cheap System-1 classifier in front of the frontier LLM).
- **[Simon Willison](../people/simon-willison.md):** Armin's *Brains vs. Hands* boundary is the exact same split Simon built in *External sandboxes for coding agents* (harness outside, untrusted execution inside Wasm/Alpine).

## Concrete Takeaways / Experiments to Try

- [ ] When building custom MCP tools or scripts for our repos (`tool-tracker`, `big-thinkers`), always return **consistent, fixed-shape JSON** regardless of result count so `execute` (Codemode) scripts never break between a 5-item probe and a full batch.
- [ ] Avoid wrapping scripts inside nested code-eval MCP tools; keep target-machine scraping/data-munching in plain Node/Python CLIs (`Hands`) and reserve `execute` (`Brain`) for composing MCP calls like `browseros-neo` + `openchamber`.

## My Notes & Reflections
*(Unread — run `/study armin-ronacher-what-is-codemode` or tell me your thoughts once you read it!)*

# Learning Goals & Signal Rubric

**Last updated:** 2026-11-22

## Purpose
This repo is not a link-hoarding bookmark dump. Its job is to follow a small, high-trust circle of engineers and builders, figure out **what they are converging or disagreeing on**, and turn their best essays, talks, and videos into **mental models and concrete experiments** I actually learn from.

---

## Focus Tracks

### Track A — Agentic Engineering, Harnesses & Model Workflows (`ai-agents`)
- **Core questions:**
  - How are top builders structuring coding-agent harnesses (in-loop vs. near-loop vs. out-loop, durable agents, small specialized agent teams, review councils)?
  - Where is the boundary between CLI/bash, Codemode, skills, and MCP?
  - How do you engineer **back pressure** and **quality gates** (tests, linters, static checks, property-based tests, sandboxes) so autonomous loops don't ship slop?
  - Which models actually win on real multi-step builds per dollar/latency (vs. leaderboard hype)?
- **Anchor voices:** Thorsten Ball, Armin Ronacher, Mario Zechner, Geoffrey Huntley, Simon Willison, AICodeKing, IndyDevDan, Chris Riccomini (`rng.md`).

### Track B — Systems Craft, Languages & Developer Tooling (`systems`)
- **Core questions:**
  - How do great systems programmers design clean boundaries, fast feedback loops, and zero-bloat architectures in Rust, Zig, Go, and Python?
  - How are terminals, worktrees, sandboxes, and reproducible environments (Ghostty/libghostty, OSC 7501, Rex, Nix overlays) evolving for the agentic era?
  - How do generative/randomized testing, fuzzing, and oracles catch bugs unit tests miss?
- **Anchor voices:** Mitchell Hashimoto, Matklad (Alex Kladov), Thorsten Ball, Armin Ronacher, Geoffrey Huntley.

### Track C — Data Infrastructure & Distributed Systems (`data-infra`)
- **Core questions:**
  - How are storage engines, shared logs, and table formats evolving over object storage (SlateDB, Iceberg, Kafka-on-S3 / Virtual Consensus / LogDrive)?
  - How are multi-engine query plans (Apache Arrow, DataFusion, Ibis, DuckDB, Substrait) replacing brittle SQL/Jinja pipelines?
  - How is AI changing the Data Platform / Data Engineering role itself?
- **Anchor voices:** Chris Riccomini, Jack Vanlightly, Simon Willison (SQLite/Datasette/Arrow).

---

## Signal Scoring Rubric (`0`–`100`)

Every candidate post/video during `/discover` is scored `0`–`100`:

| Criterion | Weight | What earns high marks |
|---|---|---|
| **Teachable mental model / pattern** | **35%** | Introduces a clear design principle, architecture pattern, or falsifiable claim I can reuse or debate |
| **Practitioner depth (scar tissue)** | **25%** | Built and tested first-hand with real code, numbers, failure modes, or counterexamples |
| **Relevance to my stack & work** | **25%** | Connects to coding-agent harnesses (OpenCode/OpenChamber/Orca/Pi), Rust/Go/Python tooling, or modern data platform infra |
| **Durability over news-cycle churn** | **15%** | Still worth having in my notes 3–12 months from now (or a decisive benchmark on a newly launched frontier model) |

### Hard Filters (Auto-cap at `<= 35` — keep out of Top Shortlist)
- Pure sponsor reads or affiliate product pitches without independent failure testing
- Minor changelog/dot-release notes unless they introduce a transferable architectural pattern
- Pure social/political dunking with zero engineering or systems takeaway
- Link-quote micro-posts that add no commentary (unless the linked primary essay itself is worth studying)

---

## Study & Attention Budget

- **Max 5 active items in `queued` + `reading`** at once — finish or skip before promoting another big batch.
- **Cross-thinker synthesis first:** Whenever two or more followed thinkers touch the same topic (e.g., Armin + Mario + Chris on *MCP vs. CLI vs. Codemode*, or Matklad + Chris + Geoff on *property-based / simulation testing*), highlight the debate explicitly in the shortlist and study notes.

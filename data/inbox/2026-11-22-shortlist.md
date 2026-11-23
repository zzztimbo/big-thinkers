# Big Thinkers Inbox Shortlist — 2026-11-22 (Inaugural Baseline Sweep)

*Collected 75 items across 14 live feeds from all 11 active thinkers (`--days 365` baseline).*

---

## What They're Talking About Right Now (Cross-Thinker Synthesis)

### 1. Owning the Harness: Brains vs. Hands, Codemode & Small Agent Teams
- **Armin Ronacher** (*What is Codemode*), **Mario Zechner** (*What I learned building an opinionated and minimal coding agent*), **IndyDevDan** (*Fable 5.2 is CRACKED but THIS goes BEYOND THE MODEL* & *Pi Durable PROACTIVE Agents*), and **Simon Willison** (*External sandboxes for coding agents* / *Datasette Lite*) are all converging on one architecture:
  - Split **the harness ("brain")** from **the sandboxed execution environment ("hands")**.
  - Don't bloat context with 50 raw MCP tools; compose harness-side operations in sandboxed JS (**Codemode**) and let the target environment use bash/CLIs.
  - Move from *human in the loop* (babysitting one terminal) to *near the loop* (small specialized agent teams + cheap System-1 classifiers like Jev queuing human decisions).

### 2. Deterministic Back Pressure Beats Human Line-by-Line Code Review
- **Thorsten Ball** (*What I believe about the future of software development*) argues traditional human line-by-line PR code review is dying; **Geoffrey Huntley** (*the answer to ai is engineering*), **Chris Riccomini** (*Code Quality Gates for Vibe-Coded Projects* & *Deterministic Simulation Testing Is Really Hard*), **Matklad** (*Finding Bugs*), and **AICodeKing** (*I get Fable-6 Level performance with this Workflow..*) show **what replaces it**:
  - **Engineered back pressure:** pre-commit architecture/domain-boundary static checks, Lizard complexity ceilings, NixOS full-fleet tests, property-based testing (Hegel/Bombadil), swarm fuzzers with reference oracles, and independent cross-model reviewer "Councils" (since models routinely pass their own unit tests while leaving symlink escapes or broken UI states).

### 3. Open Source & Dependencies in the Token Era
- **Geoffrey Huntley** (*the answer to ai is engineering* & *closed to pull requests, open to remix*), **Chris Riccomini** (*Open Source Projects Are Cached Agent Output*), and **Thorsten Ball** (*Joy & Curiosity #107* / *future of software development*) are actively debating what happens to open-source libraries:
  - Huntley argues for generating small libraries first-party and using **Nix overlays** (*patch the planet*) to monkey-patch transitive dependencies (even removing `git push --force` from agent sandboxes!).
  - Riccomini frames open source as **materialized/cached agent output** — customizable kernels whose job is saving users tokens and wall-clock time.

### 4. Terminal Protocols & Composable Cloud-Native Logs
- **Mitchell Hashimoto** (*Libghostty 1.0*, *OSC 7501*, *Superlogical*) formalized how CLI programs and coding agents report structured status to terminals/multiplexers (`OSC 7501`, already adopted by Rex and Herdr).
- On the data-infra side, **Jack Vanlightly** (*The LogDrive* & *Strong vs weak sealing*) and **Chris Riccomini** (*SlateDB / UniFFI / DST*) unpack how shared logs and LSM storage engines decompose sequencing from passive S3/object-storage durability.

---

## Ranked Shortlist (Top 10 Starters Across Tracks)

| # | Score | Thinker | Title | Track | Format / Est. | Why Study This |
|---|---:|---|---|---|---|---|
| 1 | **96** | Armin Ronacher | [What is Codemode](https://lucumr.pocoo.org/2026/10/6/codemode/) | `ai-agents` | Essay · 10m | Explains *why* Pi 1.0 added Codemode, the "Brains vs. Hands" split between harness and sandbox, and how JS tool composition beats raw MCP context bloat (directly mirrors how OpenCode `execute` works!). |
| 2 | **95** | Geoffrey Huntley | [the answer to ai is engineering](https://ghuntley.com/answer/) | `ai-agents` | Essay/Talk · 14m | Concrete playbook for "security take-off", patching transitive deps + removing `git push --force` via Nix overlays, and stopping agent loops from closing on bad code using Bombadil & Hegel property-based testing. |
| 3 | **94** | Mitchell Hashimoto | [A Terminal Protocol for Program Status (OSC 7501)](https://mitchellh.com/writing/program-status-osc7501) | `systems` | Essay · 8m | First-principles protocol design for letting coding agents and long-running CLIs report structured progress/status to terminals like Ghostty, Rex, and Herdr. |
| 4 | **93** | Matklad | [Finding Bugs](https://matklad.github.io/2026/09/19/finding-bugs.html) | `systems` | Essay · 10m | Masterclass in writing zero-allocation swarm/generative fuzzers paired with a reference oracle (`regex` vs `regex_lite`) to catch subtle algorithmic bugs unit tests miss. |
| 5 | **92** | Chris Riccomini | [Code Quality Gates for Vibe-Coded Projects](https://rng.md/posts/code-quality-for-vibe-coded-projects/) | `data-infra` | Essay · 6m | Practical `CLAUDE.md`/`AGENTS.md` quality-gate blueprint combining tests, complexity caps (`lizard.py`), lint, security, and regression checks for agentic repos. |
| 6 | **91** | Jack Vanlightly | [The LogDrive: Flexible Composition Through Abstraction in Shared Logs](https://jack-vanlightly.com/blog/2026/8/25/the-logdrive-flexible-composition-through-abstraction-in-shared-logs) | `data-infra` | Essay · 15m | Deep architectural breakdown of Confluent Kora 2 / Freight Clusters (Kafka-on-S3): decomposing Virtual Consensus into `AtomicLog` (sequencing) + `LogDrive` (RAID-like durability over S3/DynamoDB). |
| 7 | **90** | Thorsten Ball | [What I believe about the future of software development](https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/) | `ai-agents` | Essay · 6m | Thorsten's 16 planted-flag theses from Sept 2026 (death of line-level PR review, tokens as the post-binary paradigm, why product/system judgment replaces code craft). Great piece to agree and disagree with sharply. |
| 8 | **89** | AICodeKing | [This Opensource Repo Actually saves upto 98% USAGE across Codex,Claude & More!? (`pxpipe`)](https://www.youtube.com/watch?v=aFmu4rLgH8U) | `ai-agents` | Video · 10m | Empirical test of `pxpipe` (rendering dense context into 5x8px images + text factsheets): shows exact SWE-bench & hex-ID accuracy across Gemini 4, Opus 5.5, and Fable 5.2. |
| 9 | **89** | IndyDevDan | [Fable 5.2 is CRACKED but THIS goes BEYOND THE MODEL](https://www.youtube.com/watch?v=hYIymEMB9x4) | `ai-agents` | Video · 15m | Why small specialized agent teams under one Lead Agent ("human near the loop") beat both solo super-agents and chaotic async swarms. |
| 10 | **88** | Chris Riccomini | [Deterministic Simulation Testing Is Really Hard](https://rng.md/posts/deterministic-simulation-testing-is-really-hard/) | `data-infra` | Essay · 7m | Honest field notes from building SlateDB's DST harness: why expanding explored state spaces explodes false positives and invariant maintenance cost. |

---

## Honorable Mentions (Also Seen & Indexed)

- **Thorsten Ball** — [Joy & Curiosity #107](https://registerspill.thorstenball.com/p/joy-and-curiosity-107) *(2026-11-21: "Rogue Software School", Amp Boxes / Jellyware, everflux software & translucent sources)*
- **Armin Ronacher** — [AI and Irontown](https://lucumr.pocoo.org/2026/11/9/irontown/) *(2026-11-09: Princess Mononoke as a lens for AI empowerment vs. externalities)*
- **AICodeKing** — [Thanks Google! I am cancelling my Claude subscription... (`Gemini 4 Neon`)](https://www.youtube.com/watch?v=eXeJNYojT3A) *(2026-11-19: Full 6-app KingBench 4 test of Gemini 4 Neon — #2 overall at $20.36 vs. Fable 5.2's $222)*
- **AICodeKing** — [Inkling 2 Mini is "Local Opus"?](https://www.youtube.com/watch?v=JFoMJ17MOOA) *(2026-11-22: Looped transformer architecture on a 32GB Mac)*
- **Mitchell Hashimoto** — [Libghostty 1.0](https://mitchellh.com/writing/libghostty-1-0) *(2026-11-06)* & [Everyone Should Know SIMD](https://mitchellh.com/writing/everyone-should-know-simd) *(2026-07-22)*
- **Matklad** — [Avoid Public Functions Calling Other Public Functions](https://matklad.github.io/2026/10/29/pub-calls-pub.html) *(2026-10-29)* & [On Git Refs](https://matklad.github.io/2026/10/07/git-ref.html) *(2026-10-07)*
- **Simon Willison** — [Hide your slop PR descriptions behind `<details><summary>`](https://simonwillison.net/2026/Nov/9/details-summary/) *(2026-11-09)* & [Datasette Lite via Service Workers & Pyodide](https://simonwillison.net/2026/Nov/17/datasette-lite/) *(2026-11-17)*
- **Mario Zechner** — [What I learned building an opinionated and minimal coding agent](https://mariozechner.at/posts/2025-11-30-pi-coding-agent) *(foundational Pi post)*

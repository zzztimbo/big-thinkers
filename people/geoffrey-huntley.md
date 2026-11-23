# Geoffrey Huntley

- **Track:** `ai-agents`
- **Role:** Principal Engineer (Antithesis / Amp); creator of the Ralph / Wiggum Loop & *Patch the Planet*
- **Primary URL:** https://ghuntley.com
- **Feeds:** `https://ghuntley.com/rss/`
- **Social:** X `@GeoffreyHuntley`

## Why Follow
Geoffrey pioneered **loop engineering** ("Ralph / Wiggum loops") and constantly pushes past surface-level prompting into **systems engineering for autonomous agents**: engineering deterministic back pressure (compiler/static-analysis hooks, property-based testing with Hegel & Bombadil), minimizing context bloat ("too many MCP allocations on the dance floor"), and using Nix overlays as a single source of truth across laptops, CI, agent sandboxes, and production images.

## Signature Mental Models & Themes
- **Don't waste your back pressure:** A loop is only as good as the deterministic checks (types, domain-boundary static analysis, property-based tests, NixOS VM tests) that prevent it from closing on bad code.
- **Remove dangerous capabilities at the system layer:** Instead of begging an agent in a prompt not to `git push --force`, patch `git` via a Nix overlay so force-push doesn't exist in its sandbox.
- **Context allocation discipline:** Every MCP schema or skill loaded upfront steals reasoning capacity ("allocations on the dance floor"); prefer `--help` CLIs and tight context.

## Links
- Blog: https://ghuntley.com
- RSS: https://ghuntley.com/rss/
- X: https://x.com/GeoffreyHuntley

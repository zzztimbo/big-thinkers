# Big Thinkers

Follow high-signal engineers and builders across blogs, Substack, YouTube, Bluesky, and X — synthesize what they are talking about, and turn their best posts and videos into structured study notes you actually learn from.

Built with the same plain-text architecture as `tool-tracker` and `tv-tracker`: CSV + Markdown source of truth, zero npm dependencies, inbox shortlist gate before tracking, and a generated dashboard.

- **Thinker roster:** `data/people.csv` + `people/<id>.md` (11 thinkers across AI Agents, Systems Craft, and Data Infra)
- **Study queue & library:** `data/posts.csv` + `posts/<id>.md` (`queued` → `reading` → `studied` → `applied`)
- **Append-only log:** `data/events.csv`
- **Learning rubric:** `profile/learning-goals.md` (focus tracks, `0–100` signal score, 5-item active reading budget)
- **Dashboards:** `dashboard.md` and `dashboard.html` (`npm run dashboard`)

## Just ask (or use slash commands)

- **`/discover`** — Sweep all 14 live feeds (and optionally X via BrowserOS neo), synthesize cross-thinker themes, and rank must-reads in `data/inbox/YYYY-MM-DD-shortlist.md`.
- **`/discover-promote <picks>`** — Promote chosen essays/videos into `data/posts.csv` and generate study guides in `posts/<id>.md`.
- **`/study <post-id>`** — Read/watch together: unpack the mental models, compare against other thinkers, and log takeaways.
- *"Follow Martin Kleppmann"* / *"What are Armin, Mario, and Chris saying about MCP vs. CLI?"*

## Commands

```bash
npm run discover      # Collect fresh posts & videos into data/inbox/raw/
npm run mark-seen     # Mark current raw candidates as seen in data/discovery-seen.json
npm run dashboard     # Rebuild dashboard.md + dashboard.html (Node 22+, zero deps)
```

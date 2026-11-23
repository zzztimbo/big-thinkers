---
name: thinker-discovery
description: Collect new writings, newsletters, YouTube videos, and X/Bluesky threads from followed thinkers in big-thinkers, synthesize cross-thinker themes into an inbox shortlist, and promote selected items into study guides.
---

# Thinker Discovery & Synthesis Workflow

## Stage 1 — Collect (`npm run discover` + optional BrowserOS neo X sweep)

1. Run the zero-dependency collector:
   ```bash
   npm run discover
   ```
   (Pass `-- --days 30` for tighter windows or `-- --person <id>` for a single thinker.)
2. Inspect `data/inbox/raw/YYYY-MM-DD-candidates.json`.
3. **Optional X / Twitter sweep (`BrowserOS neo`):**
   - If the user asks for live X posts or a thinker's RSS has been quiet, sweep the `high` priority accounts in `data/sources.json -> xSweep.accounts` using `tools["browseros-neo"]` (`run` script opening a dedicated tab, reading recent original threads/essays, ignoring pure retweets/replies).

## Stage 2 — Thematic Synthesis & Ranked Shortlist (`data/inbox/YYYY-MM-DD-shortlist.md`)

1. Read `profile/learning-goals.md` for Track A (`ai-agents`), Track B (`systems`), Track C (`data-infra`), scoring weights, and hard filters.
2. Write `data/inbox/YYYY-MM-DD-shortlist.md` with:
   - **What They're Talking About Right Now (Cross-Thinker Synthesis):** 2–4 thematic clusters where multiple thinkers converge or disagree (e.g., *Harness Architecture & Codemode*, *Deterministic Back Pressure / Fuzzing / DST*, *Frontier vs. Cheap Worker Models*, *Object-Storage Logs & Engines*).
   - **Ranked Shortlist (Top Picks Across Tracks):** Score `0`–`100`, include Thinker, Title, URL, Format, Est. Time, Signal Score, and a 2-sentence *Why study this*.
   - **Also Seen (Lower Priority / Filtered):** Brief bullet list so nothing disappears silently.
3. Mark candidates seen so the next run only surfaces genuinely new items:
   ```bash
   npm run mark-seen
   ```
4. Append a `sweep_completed` event to `data/events.csv` and run `npm run dashboard`.
5. **Human Gate:** Present the themes + top picks (using an interactive `openui-lang` block in OpenChamber when helpful) and wait for approval before touching `data/posts.csv`.

## Stage 3 — Promote Approved Items (`/discover-promote`)

For each approved item:
1. Check active queue count (`queued` + `reading` in `data/posts.csv`) against the 5-item study budget in `profile/learning-goals.md` (warn if exceeded).
2. Generate kebab-case `id` (`<person-slug>-<short-topic-slug>`), e.g., `armin-ronacher-what-is-codemode`.
3. Fetch the full post/video description so the study guide is grounded in actual content, not just a snippet.
4. Add row to `data/posts.csv` (`status=queued`, `promoted_date=YYYY-MM-DD`, `updated_at=YYYY-MM-DD`).
5. Create `posts/<id>.md` using `templates/post.md` populated with Core Thesis, Key Ideas, Cross-Thinker Connections, and Concrete Takeaways.
6. Append `post_promoted` row to `data/events.csv` and update `data/discovery-seen.json` (`status: "promoted"`).
7. Run `npm run dashboard`.

# Big Thinkers — Data Schema

Three CSV files and one JSON source manifest hold structured state in `data/`. All CSVs use standard RFC 4180 quoting so they diff cleanly in Git.

## 1. `data/people.csv` (Followed Thinkers)

One row per person or channel you follow. Keep column order exact.

| Column | Type | Notes |
|---|---|---|
| `id` | string | Unique kebab-case slug (`thorsten-ball`, `chris-riccomini`, `aicodeking`). Matches `people/<id>.md`. |
| `name` | string | Display name. |
| `track` | enum | Primary track: `ai-agents`, `systems`, `data-infra`. |
| `role` | string | Short descriptor of what they build / are known for. |
| `topics` | string | Semicolon-separated topics (`coding-agents;harnesses;go;craft`). |
| `platforms` | string | Semicolon-separated active platforms (`substack;blog;x`, `youtube;x`, etc.). |
| `x_handle` | string | X/Twitter handle without `@` (e.g. `thorstenball`), or empty. |
| `bluesky_handle` | string | Bluesky handle (e.g. `chris.blue`), or empty. |
| `youtube_channel_id` | string | YouTube `UC...` channel ID for `/feeds/videos.xml?channel_id=...`, or empty. |
| `primary_url` | string | Main website, newsletter, or channel URL. |
| `feed_urls` | string | Semicolon-separated RSS/Atom feed URLs (also mirrored in `data/sources.json`). |
| `cadence` | string | Typical publishing pace (`weekly`, `monthly`, `daily`, `irregular`). |
| `priority` | enum | `high`, `medium`, `low` — weight given during `/discover` triage. |
| `status` | enum | `active`, `paused`, `archived`. |
| `added_date` | date | `YYYY-MM-DD` added to roster. |
| `last_checked` | date | `YYYY-MM-DD` feeds/socials were last swept. |
| `updated_at` | date | `YYYY-MM-DD` row was last edited. |
| `notes` | string | One-line note on *why* you follow them and what to pay attention to. |

## 2. `data/posts.csv` (Promoted Reading & Study Queue)

One row per post, essay, video, or X thread **promoted** from an inbox shortlist (or added directly by request). Raw feed items never enter `posts.csv` until approved.

| Column | Type | Notes |
|---|---|---|
| `id` | string | Unique kebab-case slug (`armin-ronacher-what-is-codemode`). Matches `posts/<id>.md`. |
| `person_id` | string | Foreign key matching `data/people.csv.id`. |
| `platform` | enum | `blog`, `substack`, `youtube`, `x`, `bluesky`, `podcast`, `talk`. |
| `title` | string | Post/video title. |
| `url` | string | Canonical URL (tracking params stripped). |
| `published_date` | date | `YYYY-MM-DD` originally published. |
| `promoted_date` | date | `YYYY-MM-DD` promoted into study queue. |
| `status` | enum | `queued`, `reading`, `studied`, `applied`, `skipped`, `archived` (see `statuses.md`). |
| `signal_score` | number | `0`–`100` score against `profile/learning-goals.md`. |
| `track` | enum | `ai-agents`, `systems`, `data-infra`. |
| `format` | enum | `essay`, `video`, `newsletter`, `thread`, `interview`, `release-note`. |
| `est_minutes` | number | Estimated minutes to read or watch. |
| `thesis` | string | One-sentence core argument or claim. |
| `key_takeaways` | string | Semicolon-separated headline takeaways (full breakdown lives in `posts/<id>.md`). |
| `applied_notes` | string | How you applied or tested the idea in your own work (or next experiment to try). |
| `tags` | string | Semicolon-separated free-form tags (`codemode;mcp;pi-agent;sandboxing`). |
| `updated_at` | date | `YYYY-MM-DD` last updated. |

## 3. `data/events.csv` (Append-Only History)

Never edit or delete existing rows; append one row per state change.

| Column | Type | Notes |
|---|---|---|
| `date` | date | `YYYY-MM-DD` |
| `entity_type` | enum | `person`, `post`, `sweep` |
| `entity_id` | string | Thinker `id`, post `id`, or sweep date (`2026-11-22`). |
| `event` | enum | `person_added`, `person_updated`, `sweep_completed`, `post_promoted`, `reading_started`, `studied`, `applied`, `skipped`, `note` |
| `note` | string | Self-contained context with key findings and source links. |

# Agent Operating Manual — big-thinkers

**Purpose:** Any agent (OpenChamber / OpenCode, Pi Agent, Claude Code, Codex, Orca) can pick up this file and run the `big-thinkers` reading, synthesis, and learning workflow cleanly.

---

## 1. Repo Mental Model

```text
big-thinkers/
├── data/
│   ├── people.csv            ← SOURCE OF TRUTH: thinkers & channels followed
│   ├── posts.csv             ← SOURCE OF TRUTH: promoted posts/videos in your study queue & library
│   ├── events.csv            ← APPEND-ONLY history (never edit/delete rows)
│   ├── sources.json          ← Automated RSS/Atom/YouTube/Bluesky feeds + X sweep handles
│   ├── discovery-seen.json   ← Deduplication state across /discover runs
│   ├── inbox/
│   │   ├── raw/              ← Raw collector JSON (gitignored)
│   │   └── YYYY-MM-DD-shortlist.md ← Synthesized thematic digests + ranked candidates
│   ├── schema.md             ← Exact column definitions
│   └── statuses.md           ← Study lifecycle states
├── profile/
│   └── learning-goals.md     ← Focus tracks, 0–100 signal rubric, hard filters, 5-item queue budget
├── people/
│   └── <id>.md               ← Thinker profile, signature mental models & links
├── posts/
│   └── <id>.md               ← Per-post/video study guide & your reflections
├── templates/
│   ├── person.md
│   └── post.md
├── scripts/
│   ├── discover.mjs          ← Zero-dep RSS/Atom/YouTube/Bluesky collector (Node 22+)
│   └── build-dashboard.mjs   ← Generates dashboard.html + dashboard.md
├── .opencode/commands/       ← /discover, /discover-promote, /study
├── .agents/skills/           ← thinker-discovery skill
├── dashboard.html            ← Generated visual dashboard
├── dashboard.md              ← Generated Markdown dashboard
└── AGENTS.md                 ← THIS FILE
```

**Golden rule:** `data/people.csv`, `data/posts.csv`, and `data/events.csv` are the database. Raw feed sweeps go to `data/inbox/` first—**never** write unapproved feed items into `data/posts.csv`.

---

## 2. Core Workflows

### 2.1 Discover & Synthesize (`/discover`)
**Trigger:** `/discover` or "What are people talking about?" / "Check for new posts"

1. Run `npm run discover` (`scripts/discover.mjs collect`) to fetch all active RSS, Atom, Substack, Bluesky, and YouTube feeds in `data/sources.json`.
2. Optionally sweep X/Twitter `@handles` (`data/sources.json -> xSweep`) via **BrowserOS neo** when social threads are requested or RSS has been quiet.
3. Score candidates (`0`–`100`) against `profile/learning-goals.md` and write `data/inbox/YYYY-MM-DD-shortlist.md` starting with **Cross-Thinker Themes** (where 2+ thinkers agree, clash, or build on the same idea) followed by the **Ranked Shortlist**.
4. Run `npm run mark-seen`, append `sweep_completed` to `data/events.csv`, and run `npm run dashboard`.
5. Present the synthesis + top picks to the user and wait for their selection before touching `data/posts.csv`.

### 2.2 Promote to Study Queue (`/discover-promote`)
**Trigger:** `/discover-promote <picks>` or user approves cards/items from the shortlist

1. Check active queue count (`queued` + `reading` in `data/posts.csv`) against the **max 5 active items** budget in `profile/learning-goals.md`.
2. Fetch full source content (`webfetch` for articles; `<media:description>` + transcript via BrowserOS neo if needed for YouTube).
3. Add row to `data/posts.csv` (`status=queued`), create `posts/<id>.md` from `templates/post.md` with real thesis, key ideas, cross-thinker connections, and actionable experiments.
4. Append `post_promoted` to `data/events.csv`, update `data/discovery-seen.json`, and run `npm run dashboard`.

### 2.3 Study & Apply (`/study`)
**Trigger:** `/study <id>` or "Let's read/discuss [post]" / "Just finished [post], here's my takeaway..."

1. Walk through the essay/video's arguments, mental models, and weak spots with the user.
2. Capture their reactions or experiments in `posts/<id>.md` (`## My Notes & Reflections`) and `data/posts.csv` (`status` → `studied` or `applied`, `applied_notes`, `updated_at`).
3. Append `studied` or `applied` to `data/events.csv` and run `npm run dashboard`.

### 2.4 Follow a New Thinker
**Trigger:** "Follow [Name / Channel]"

1. Verify their RSS/Atom feed, Substack, Bluesky RSS (`https://bsky.app/profile/<handle>/rss`), YouTube `channel_id` (`/feeds/videos.xml?channel_id=UC...`), and X handle.
2. Add row to `data/people.csv`, add automated feed entries to `data/sources.json`, create `people/<id>.md` from `templates/person.md`, append `person_added` to `data/events.csv`, and run `npm run dashboard`.

---

## 3. Source Strategy by Platform

| Platform | Primary Mechanism | Fallback / Deep Dive |
|---|---|---|
| Blogs & Personal Sites | `scripts/discover.mjs` (RSS/Atom) | `webfetch` for full article text |
| Substack Newsletters | `scripts/discover.mjs` (`/feed`) | `webfetch` / Gmail newsletter check |
| YouTube Channels | `scripts/discover.mjs` (`/feeds/videos.xml?channel_id=...` + `<media:description>`) | BrowserOS neo for live transcript/chapters |
| Bluesky | `scripts/discover.mjs` (`https://bsky.app/profile/<handle>/rss`) | `webfetch` linked posts |
| X / Twitter | **BrowserOS neo** (authenticated profile sweep) | `websearch` for specific viral threads |

---

## 4. CSV Discipline (Non-Negotiable)

- **`people.csv` & `posts.csv`:** Always update `updated_at` to today (`YYYY-MM-DD`) on any edit; quote fields containing commas, quotes, or newlines; semicolon-separate multi-value fields (`topics`, `platforms`, `feed_urls`, `key_takeaways`, `tags`).
- **`events.csv`:** Strictly append-only. Never edit or delete prior rows.
- **Dashboard:** Always run `npm run dashboard` after modifying any CSV or inbox shortlist.

---

## 5. Repo Workflow (Path B: GitButler + Entire + Orca)

Load and follow the **`entire-orca-workflow`** skill for the 5-phase execution checklist, troubleshooting table, and `--gate in-review` completion check. Key rules:

1. **GitButler (`but`) for all VCS writes** on unstacked branches (`but commit -b <branch> -m "..." <paths>` → `but push <branch>`). Never stop at `but push`.
2. **Entire Checkpoints on commits:** Ensure `~/.pi/agent/extensions/entire-but-bridge.ts` is installed so commits carry `Entire-Checkpoint:` trailers and checkpoints are pushed to `origin`.
3. **Entire Trail + Shadow PR sync:** Create a Trail (`entire trail create --branch <branch> --base main ...`) and update the shadow PR via `gh pr edit` to add `Fixes #<N>` while **preserving `<!-- entire-shadow-pr -->`**.
4. **Trail-posted `entire review`:** Always run `entire review` with `output: "trail"` (never `local`). On zero findings (`approve`), record explicit approval via `entire trail approve <trail> --branch <branch> -m "..."`.
5. **Completion gate:** Before ending a task, verify:
   ```bash
   node ~/.pi/agent/skills/entire-orca-workflow/scripts/preflight.mjs --gate in-review --branch <branch> --issue <N>
   ```

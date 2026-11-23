---
description: Deep-dive a promoted post or YouTube video with me — extract core mental models, connect to other thinkers, and update posts/<id>.md
---

Deep-study the requested item from `data/posts.csv` (or promote & study a URL directly if given):

Target: $ARGUMENTS

1. Fetch the full article text (`webfetch`) or YouTube video metadata/transcript (`webfetch` / BrowserOS neo).
2. Break down the core thesis, mental models, concrete technical mechanisms, and how it connects to or clashes with other thinkers in `data/people.csv`.
3. Update `posts/<id>.md` and `data/posts.csv` (`status` -> `reading` or `studied`), append to `data/events.csv`, run `npm run dashboard`, and walk me through the best lessons + 1–2 reflection questions.

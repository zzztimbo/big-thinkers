---
description: Promote chosen essays/videos from the latest shortlist into data/posts.csv, create study guides in posts/<id>.md, and rebuild the dashboard
---

Load `.agents/skills/thinker-discovery/SKILL.md` and run **Stage 3 (Promote & Scaffold Study Guides)** for the user's selection from the latest `data/inbox/*-shortlist.md`:

Selection: $ARGUMENTS

Follow `AGENTS.md` strictly: enforce the 5-item active study queue budget (or warn if exceeded), append `post_promoted` rows to `data/events.csv`, write thorough study guides in `posts/<id>.md` from the live source, mark `promoted` in `data/discovery-seen.json`, and run `npm run dashboard`.

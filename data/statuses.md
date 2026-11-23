# Status Definitions

## 1. Post Study Lifecycle (`data/posts.csv`)

```text
(inbox shortlist) → queued → reading → studied → applied
```

Terminal / side states: `skipped`, `archived`.

| Status | Meaning | Typical Next Action |
|---|---|---|
| `queued` | Promoted from shortlist (or added directly); study guide scaffolded in `posts/<id>.md`. | Read/watch or run `/study <id>` |
| `reading` | Currently reading/watching and discussing with the agent. | Capture takeaways & move to `studied` |
| `studied` | Read/watched; key mental models, critiques, and takeaways captured in `posts/<id>.md`. | Try an idea in a project (`applied`) or leave as reference |
| `applied` | Directly influenced a tool choice, workflow, harness, or architecture decision. | Document what changed in `applied_notes` |
| `skipped` | Promoted earlier, decided not worth finishing. | Record brief reason |
| `archived` | Older reference kept for searchability. | None |

## 2. Thinker Roster Statuses (`data/people.csv`)

| Status | Meaning |
|---|---|
| `active` | Swept on every `/discover` run. |
| `paused` | Kept in roster and `people/<id>.md`, temporarily skipped during sweeps. |
| `archived` | No longer following actively. |

## 3. Event Types (`data/events.csv`)

`person_added`, `person_updated`, `sweep_completed`, `post_promoted`, `reading_started`, `studied`, `applied`, `skipped`, `note`

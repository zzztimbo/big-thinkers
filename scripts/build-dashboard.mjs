#!/usr/bin/env node
/**
 * Big Thinkers Dashboard Generator
 * Reads data/people.csv, data/posts.csv, data/events.csv, and latest inbox shortlist,
 * then generates dashboard.md and dashboard.html.
 * Run with: npm run dashboard
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const INBOX_DIR = path.join(DATA_DIR, 'inbox');

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function readCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] ?? '';
    });
    return obj;
  });
}

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escMdCell(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ');
}

function getLatestShortlist() {
  if (!fs.existsSync(INBOX_DIR)) return null;
  const files = fs
    .readdirSync(INBOX_DIR)
    .filter(f => f.endsWith('-shortlist.md'))
    .sort()
    .reverse();
  if (files.length === 0) return null;
  return {
    filename: files[0],
    relPath: `data/inbox/${files[0]}`,
    content: fs.readFileSync(path.join(INBOX_DIR, files[0]), 'utf8'),
  };
}

const today = new Date().toISOString().slice(0, 10);
const people = readCSV(path.join(DATA_DIR, 'people.csv'));
const posts = readCSV(path.join(DATA_DIR, 'posts.csv'));
const events = readCSV(path.join(DATA_DIR, 'events.csv'));
const latestShortlist = getLatestShortlist();

const peopleMap = new Map(people.map(p => [p.id, p]));
const activeQueue = posts
  .filter(p => p.status === 'reading' || p.status === 'queued')
  .sort((a, b) => Number(b.signal_score || 0) - Number(a.signal_score || 0));
const studiedPosts = posts
  .filter(p => p.status === 'studied' || p.status === 'applied')
  .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
const recentEvents = [...events].reverse().slice(0, 15);

// 1. Build dashboard.md
let md = `# Big Thinkers Dashboard\n\n*Generated: ${today}*\n\n`;
md += `- **Active Thinkers:** ${people.filter(p => p.status === 'active').length}\n`;
md += `- **Active Study Queue (\`queued\` + \`reading\`):** ${activeQueue.length} / 5 budget\n`;
md += `- **Studied & Applied Notes:** ${studiedPosts.length}\n`;
if (latestShortlist) {
  md += `- **Latest Inbox Shortlist:** [${latestShortlist.filename}](${latestShortlist.relPath})\n`;
}
md += `\n---\n\n## Active Study Queue\n\n`;

if (activeQueue.length === 0) {
  md += latestShortlist
    ? `*Queue is clear. Pick items from [${latestShortlist.filename}](${latestShortlist.relPath}) and run \`/discover-promote\`.*\n\n`
    : `*No posts queued yet. Run \`/discover\` to collect the latest writings and videos.*\n\n`;
} else {
  md += `| Post / Video | Thinker | Platform | Status | Signal | Est. | Thesis |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  for (const p of activeQueue) {
    const thinker = peopleMap.get(p.person_id)?.name || p.person_id;
    md += `| [${escMdCell(p.title)}](posts/${p.id}.md) ([src](${p.url})) | ${escMdCell(thinker)} | ${p.platform} | \`${p.status}\` | ${p.signal_score || '—'} | ${p.est_minutes ? `${p.est_minutes}m` : '—'} | ${escMdCell(p.thesis)} |\n`;
  }
  md += `\n`;
}

if (studiedPosts.length > 0) {
  md += `## Studied & Applied Library\n\n`;
  md += `| Post / Video | Thinker | Status | Key Takeaways | Applied Notes |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const p of studiedPosts) {
    const thinker = peopleMap.get(p.person_id)?.name || p.person_id;
    md += `| [${escMdCell(p.title)}](posts/${p.id}.md) | ${escMdCell(thinker)} | \`${p.status}\` | ${escMdCell(p.key_takeaways)} | ${escMdCell(p.applied_notes || '—')} |\n`;
  }
  md += `\n`;
}

md += `---\n\n## Followed Thinkers (${people.length})\n\n`;
for (const track of ['ai-agents', 'systems', 'data-infra']) {
  const group = people.filter(p => p.track === track);
  if (group.length === 0) continue;
  const label =
    track === 'ai-agents'
      ? 'Track A — Agentic Engineering & Harnesses'
      : track === 'systems'
        ? 'Track B — Systems Craft & Developer Tooling'
        : 'Track C — Data Infrastructure & Distributed Systems';
  md += `### ${label}\n\n`;
  md += `| Thinker | Platforms | Cadence | Priority | Last Checked | Why Follow |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const p of group) {
    md += `| [${escMdCell(p.name)}](people/${p.id}.md) ([site](${p.primary_url})) | ${escMdCell(p.platforms)} | ${p.cadence} | ${p.priority} | ${p.last_checked || '—'} | ${escMdCell(p.notes)} |\n`;
  }
  md += `\n`;
}

md += `---\n\n## Recent Events\n\n`;
md += `| Date | Type | Entity | Event | Note |\n`;
md += `|---|---|---|---|---|\n`;
for (const e of recentEvents) {
  md += `| ${e.date} | ${e.entity_type} | \`${escMdCell(e.entity_id)}\` | \`${e.event}\` | ${escMdCell(e.note)} |\n`;
}

fs.writeFileSync(path.join(ROOT, 'dashboard.md'), md);

// 2. Build dashboard.html
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Big Thinkers — Learning Dashboard</title>
  <style>
    :root {
      color-scheme: dark light;
      --bg: #0d1117;
      --card: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --accent: #58a6ff;
      --green: #3fb950;
      --amber: #d29922;
      --purple: #bc8cff;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f6f8fa;
        --card: #ffffff;
        --border: #d0d7de;
        --text: #1f2328;
        --muted: #656d76;
        --accent: #0969da;
        --green: #1a7f37;
        --amber: #9a6700;
        --purple: #8250df;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 2rem 1.25rem 4rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .wrap { max-width: 1120px; margin: 0 auto; }
    header { margin-bottom: 1.75rem; }
    h1 { margin: 0 0 0.35rem; font-size: 1.75rem; }
    h2 { margin: 2rem 0 0.75rem; font-size: 1.2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; }
    .sub { color: var(--muted); font-size: 0.92rem; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 0.9rem;
      margin: 1.25rem 0 1.75rem;
    }
    .stat {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.15rem;
    }
    .stat-label { color: var(--muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .stat-val { font-size: 1.65rem; font-weight: 700; margin-top: 0.25rem; }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 0.9rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.1rem;
    }
    .card h3 { margin: 0 0 0.3rem; font-size: 1.02rem; }
    .card p { margin: 0.45rem 0; font-size: 0.9rem; color: var(--muted); }
    .badges { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.45rem; }
    .badge {
      font-size: 0.72rem;
      padding: 0.12rem 0.5rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      color: var(--muted);
    }
    .badge.ai-agents { color: var(--green); border-color: color-mix(in srgb, var(--green) 45%, transparent); }
    .badge.systems { color: var(--amber); border-color: color-mix(in srgb, var(--amber) 45%, transparent); }
    .badge.data-infra { color: var(--purple); border-color: color-mix(in srgb, var(--purple) 45%, transparent); }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    th, td { text-align: left; padding: 0.65rem 0.85rem; border-bottom: 1px solid var(--border); font-size: 0.88rem; vertical-align: top; }
    th { color: var(--muted); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.03em; }
    tr:last-child td { border-bottom: none; }
    .empty { background: var(--card); border: 1px dashed var(--border); border-radius: 10px; padding: 1.25rem; color: var(--muted); }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Big Thinkers</h1>
      <div class="sub">Personal technical reading, synthesis & learning tracker · Generated ${escHtml(today)}</div>
    </header>

    <div class="stats">
      <div class="stat">
        <div class="stat-label">Active Thinkers</div>
        <div class="stat-val">${people.filter(p => p.status === 'active').length}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Study Queue (Budget: 5)</div>
        <div class="stat-val">${activeQueue.length} / 5</div>
      </div>
      <div class="stat">
        <div class="stat-label">Studied & Applied</div>
        <div class="stat-val">${studiedPosts.length}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Latest Shortlist</div>
        <div class="stat-val" style="font-size:1rem;margin-top:0.6rem;">
          ${latestShortlist ? `<a href="${escHtml(latestShortlist.relPath)}">${escHtml(latestShortlist.filename)}</a>` : 'None yet'}
        </div>
      </div>
    </div>

    <h2>Active Study Queue</h2>
    ${
      activeQueue.length === 0
        ? `<div class="empty">${
            latestShortlist
              ? `Study queue is open. Review <code>${escHtml(latestShortlist.relPath)}</code> and run <code>/discover-promote</code> to pull items into your study queue.`
              : `No items queued yet. Run <code>/discover</code> to collect fresh essays and videos.`
          }</div>`
        : `<table>
            <thead>
              <tr><th>Title</th><th>Thinker</th><th>Platform</th><th>Status</th><th>Signal</th><th>Thesis</th></tr>
            </thead>
            <tbody>
              ${activeQueue
                .map(p => {
                  const thinker = peopleMap.get(p.person_id)?.name || p.person_id;
                  return `<tr>
                    <td><a href="${escHtml(p.url)}" target="_blank" rel="noopener">${escHtml(p.title)}</a></td>
                    <td>${escHtml(thinker)}</td>
                    <td>${escHtml(p.platform)}</td>
                    <td><code>${escHtml(p.status)}</code></td>
                    <td>${escHtml(p.signal_score || '—')}</td>
                    <td>${escHtml(p.thesis)}</td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>`
    }

    <h2>Followed Thinkers (${people.length})</h2>
    <div class="card-grid">
      ${people
        .map(
          p => `<div class="card">
            <div class="badges">
              <span class="badge ${escHtml(p.track)}">${escHtml(p.track)}</span>
              <span class="badge">${escHtml(p.platforms)}</span>
              <span class="badge">${escHtml(p.cadence)}</span>
            </div>
            <h3><a href="${escHtml(p.primary_url)}" target="_blank" rel="noopener">${escHtml(p.name)}</a></h3>
            <p>${escHtml(p.role)}</p>
            <p style="color:var(--text);font-size:0.86rem;">${escHtml(p.notes)}</p>
          </div>`
        )
        .join('')}
    </div>

    <h2>Recent Activity</h2>
    <table>
      <thead>
        <tr><th>Date</th><th>Entity</th><th>Event</th><th>Note</th></tr>
      </thead>
      <tbody>
        ${recentEvents
          .map(
            e => `<tr>
              <td style="white-space:nowrap;">${escHtml(e.date)}</td>
              <td><code>${escHtml(e.entity_id)}</code></td>
              <td><code>${escHtml(e.event)}</code></td>
              <td>${escHtml(e.note)}</td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'dashboard.html'), html);
console.log(`Built dashboard.md and dashboard.html (${people.length} thinkers, ${posts.length} tracked posts).`);

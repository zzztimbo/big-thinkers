#!/usr/bin/env node
/**
 * Big Thinkers Discovery Collector
 * Zero-dependency Node 22+ script that collects new posts, newsletters, Bluesky threads,
 * and YouTube videos across all active thinkers in data/people.csv + data/sources.json.
 *
 * Commands:
 *   node scripts/discover.mjs collect [--days 90] [--person <id>] [--include-seen]
 *   node scripts/discover.mjs mark-seen [--date YYYY-MM-DD]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const INBOX_RAW_DIR = path.join(DATA_DIR, 'inbox', 'raw');

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

function parseCSV(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] ?? '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

function escapeCSVField(val) {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function serializeCSV(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escapeCSVField(row[h] ?? '')).join(','));
  }
  return lines.join('\n') + '\n';
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function stripHtml(html) {
  if (!html) return '';
  const decoded = decodeEntities(html);
  return decoded
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function extractTag(block, tagName) {
  const re = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const m = block.match(re);
  return m ? decodeEntities(m[1]).trim() : '';
}

function extractAtomLink(block, baseUrl) {
  const linkTags = [...block.matchAll(/<link\b([^>]*)\/?>/gi)];
  let best = '';
  for (const m of linkTags) {
    const attrs = m[1] || '';
    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const relMatch = attrs.match(/\brel=["']([^"']+)["']/i);
    const rel = relMatch ? relMatch[1].toLowerCase() : 'alternate';
    if (rel === 'alternate') {
      best = hrefMatch[1];
      break;
    }
    if (!best && rel !== 'self' && rel !== 'replies') {
      best = hrefMatch[1];
    }
  }
  if (!best) return '';
  try {
    return new URL(decodeEntities(best), baseUrl).toString();
  } catch {
    return decodeEntities(best);
  }
}

function normalizeUrl(rawUrl, baseUrl) {
  if (!rawUrl) return '';
  try {
    const u = new URL(rawUrl.trim(), baseUrl);
    for (const key of [...u.searchParams.keys()]) {
      if (/^(utm_|ref$|fromSource$)/i.test(key)) {
        u.searchParams.delete(key);
      }
    }
    if (u.protocol === 'http:' && (u.hostname === 'thorstenball.com' || u.hostname === 'simonwillison.net')) {
      u.protocol = 'https:';
    }
    return u.toString();
  } catch {
    return rawUrl.trim();
  }
}

function parseDateISO(rawDate) {
  if (!rawDate) return '';
  const d = new Date(rawDate.trim());
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function extractYouTubeExtras(mediaDesc) {
  if (!mediaDesc) return { summary: '', takeaways: [], chapters: [] };
  const lines = mediaDesc.split(/\r?\n/).map(l => l.trim());
  const takeaways = [];
  const chapters = [];
  const summaryLines = [];

  let mode = 'intro';
  for (const line of lines) {
    if (!line || line === '--') continue;
    if (/^(?:🛠️\s*|💡\s*|✅\s*)?key takeaways:?$/i.test(line)) {
      mode = 'takeaways';
      continue;
    }
    if (/^(?:📖\s*)?(?:timestamps|chapters):?$/i.test(line)) {
      mode = 'chapters';
      continue;
    }
    if (/^links:?$/i.test(line)) {
      mode = 'links';
      continue;
    }
    if (/^\d{1,2}:\d{2}(?::\d{2})?\s*[-–—]?\s*.+/.test(line)) {
      chapters.push(line);
      continue;
    }
    if (mode === 'takeaways') {
      if (/^#[a-z0-9_]+/i.test(line)) continue;
      takeaways.push(line.replace(/^[•\-*]\s*/, ''));
    } else if (mode === 'intro') {
      if (
        !/^join this channel/i.test(line) &&
        !/^https?:\/\//i.test(line) &&
        !/^sponsored by/i.test(line)
      ) {
        summaryLines.push(line);
      }
    }
  }

  return {
    summary: summaryLines.slice(0, 3).join(' ').slice(0, 500),
    takeaways: takeaways.slice(0, 8),
    chapters: chapters.slice(0, 12),
  };
}

function parseFeedXml(xml, feedMeta) {
  const items = [];
  const isAtom = /<feed[\s>]/i.test(xml) && /<entry[\s>]/i.test(xml);

  if (isAtom) {
    const entryBlocks = [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)];
    for (const m of entryBlocks) {
      const block = m[1];
      const title = stripHtml(extractTag(block, 'title')) || '(Untitled)';
      const url = normalizeUrl(extractAtomLink(block, feedMeta.url), feedMeta.url);
      const publishedRaw = extractTag(block, 'published') || extractTag(block, 'updated');
      const publishedDate = parseDateISO(publishedRaw);
      const mediaDesc = decodeEntities(extractTag(block, 'media:description'));
      const rawBody =
        mediaDesc ||
        extractTag(block, 'summary') ||
        extractTag(block, 'content');
      const plainText = stripHtml(rawBody);

      let excerpt = plainText.replace(/\s+/g, ' ').slice(0, 420);
      let takeaways = [];
      let chapters = [];

      if (feedMeta.platform === 'youtube' && mediaDesc) {
        const yt = extractYouTubeExtras(mediaDesc);
        if (yt.summary) excerpt = yt.summary;
        takeaways = yt.takeaways;
        chapters = yt.chapters;
      }

      const estMinutes =
        feedMeta.platform === 'youtube'
          ? 12
          : Math.max(2, Math.round(plainText.split(/\s+/).filter(Boolean).length / 220));

      items.push({
        feed_id: feedMeta.id,
        person_id: feedMeta.person_id,
        source_name: feedMeta.name,
        platform: feedMeta.platform,
        format: feedMeta.format,
        track: feedMeta.track,
        title,
        url,
        published_date: publishedDate,
        est_minutes: estMinutes,
        excerpt,
        takeaways,
        chapters,
      });
    }
  } else {
    const itemBlocks = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
    for (const m of itemBlocks) {
      const block = m[1];
      let title = stripHtml(extractTag(block, 'title'));
      const linkRaw = extractTag(block, 'link') || extractAtomLink(block, feedMeta.url);
      const url = normalizeUrl(linkRaw, feedMeta.url);
      const pubRaw = extractTag(block, 'pubDate') || extractTag(block, 'dc:date');
      const publishedDate = parseDateISO(pubRaw);
      const encoded = extractTag(block, 'content:encoded');
      const desc = extractTag(block, 'description');
      const plainFull = stripHtml(encoded || desc);
      const plainDesc = stripHtml(desc || encoded);

      if (!title) {
        const firstLine = plainDesc.split('\n')[0] || '(Post)';
        title = firstLine.length > 95 ? `${firstLine.slice(0, 92)}...` : firstLine;
      }

      const wordCount = plainFull.split(/\s+/).filter(Boolean).length;
      const estMinutes = Math.max(1, Math.round(wordCount / 220));

      items.push({
        feed_id: feedMeta.id,
        person_id: feedMeta.person_id,
        source_name: feedMeta.name,
        platform: feedMeta.platform,
        format: feedMeta.format,
        track: feedMeta.track,
        title,
        url,
        published_date: publishedDate,
        est_minutes: estMinutes,
        excerpt: plainDesc.replace(/\s+/g, ' ').slice(0, 420),
        takeaways: [],
        chapters: [],
      });
    }
  }

  return items.slice(0, feedMeta.maxItems || 6);
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'big-thinkers-collector/1.0 (+local)',
        Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) {
      return { feed, ok: false, error: `HTTP ${res.status}`, items: [] };
    }
    const xml = await res.text();
    const items = parseFeedXml(xml, feed);
    return { feed, ok: true, items };
  } catch (err) {
    return { feed, ok: false, error: err?.message || String(err), items: [] };
  } finally {
    clearTimeout(timer);
  }
}

function parseArgs(argv) {
  const args = { cmd: argv[2] || 'collect', days: 120, person: null, includeSeen: false, date: todayISO() };
  for (let i = 3; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--days' && argv[i + 1]) args.days = Number(argv[++i]);
    else if (a === '--person' && argv[i + 1]) args.person = argv[++i];
    else if (a === '--include-seen') args.includeSeen = true;
    else if (a === '--date' && argv[i + 1]) args.date = argv[++i];
  }
  return args;
}

async function runCollect(args) {
  const sources = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'sources.json'), 'utf8'));
  const peopleCsvPath = path.join(DATA_DIR, 'people.csv');
  const postsCsvPath = path.join(DATA_DIR, 'posts.csv');
  const seenPath = path.join(DATA_DIR, 'discovery-seen.json');

  const peopleParsed = parseCSV(fs.readFileSync(peopleCsvPath, 'utf8'));
  const postsParsed = fs.existsSync(postsCsvPath)
    ? parseCSV(fs.readFileSync(postsCsvPath, 'utf8'))
    : { headers: [], rows: [] };
  const seen = fs.existsSync(seenPath) ? JSON.parse(fs.readFileSync(seenPath, 'utf8')) : {};

  const activePeople = new Map(
    peopleParsed.rows
      .filter(p => p.status === 'active' && (!args.person || p.id === args.person))
      .map(p => [p.id, p])
  );

  const trackedUrls = new Set(postsParsed.rows.map(r => normalizeUrl(r.url)));
  const cutoffMs = Date.now() - args.days * 24 * 60 * 60 * 1000;

  const feedsToRun = (sources.feeds || []).filter(f => activePeople.has(f.person_id));
  console.log(`Sweeping ${feedsToRun.length} feeds across ${activePeople.size} active thinkers (window: ${args.days}d)...`);

  const results = await Promise.all(feedsToRun.map(f => fetchFeed(f)));

  const candidates = [];
  const seenUrlsInRun = new Set();
  const checkedPeople = new Set();
  const feedReport = [];

  for (const r of results) {
    feedReport.push({
      id: r.feed.id,
      person_id: r.feed.person_id,
      ok: r.ok,
      fetched: r.items.length,
      error: r.error || null,
    });
    if (r.ok) checkedPeople.add(r.feed.person_id);

    for (const item of r.items) {
      if (!item.url || seenUrlsInRun.has(item.url)) continue;
      seenUrlsInRun.add(item.url);

      if (trackedUrls.has(item.url)) continue;
      if (!args.includeSeen && seen[item.url]) continue;

      if (item.published_date) {
        const pubMs = new Date(`${item.published_date}T00:00:00Z`).getTime();
        if (!Number.isNaN(pubMs) && pubMs < cutoffMs) continue;
      }

      const person = activePeople.get(item.person_id);
      candidates.push({
        ...item,
        person_name: person?.name || item.person_id,
        person_priority: person?.priority || 'medium',
      });
    }
  }

  candidates.sort((a, b) => (b.published_date || '').localeCompare(a.published_date || ''));

  fs.mkdirSync(INBOX_RAW_DIR, { recursive: true });
  const outPath = path.join(INBOX_RAW_DIR, `${args.date}-candidates.json`);
  const payload = {
    generated_at: new Date().toISOString(),
    date: args.date,
    window_days: args.days,
    total_candidates: candidates.length,
    feeds: feedReport,
    x_accounts_for_neo_sweep: (sources.xSweep?.accounts || []).filter(a => activePeople.has(a.person_id)),
    candidates,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');

  const today = todayISO();
  for (const row of peopleParsed.rows) {
    if (checkedPeople.has(row.id)) {
      row.last_checked = today;
    }
  }
  fs.writeFileSync(peopleCsvPath, serializeCSV(peopleParsed.headers, peopleParsed.rows));

  console.log(`\nFeed status:`);
  for (const f of feedReport) {
    console.log(`  ${f.ok ? '✓' : '✗'} ${f.id.padEnd(26)} fetched=${String(f.fetched).padStart(2)}${f.error ? ` (${f.error})` : ''}`);
  }
  console.log(`\nWrote ${candidates.length} fresh candidates -> ${path.relative(ROOT, outPath)}`);
}

function runMarkSeen(args) {
  const rawPath = path.join(INBOX_RAW_DIR, `${args.date}-candidates.json`);
  if (!fs.existsSync(rawPath)) {
    console.error(`No raw candidate file found at ${rawPath}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const seenPath = path.join(DATA_DIR, 'discovery-seen.json');
  const seen = fs.existsSync(seenPath) ? JSON.parse(fs.readFileSync(seenPath, 'utf8')) : {};

  let added = 0;
  for (const c of raw.candidates || []) {
    if (c.url && !seen[c.url]) {
      seen[c.url] = {
        person_id: c.person_id,
        title: c.title,
        seen_date: args.date,
        status: 'shortlisted',
      };
      added++;
    }
  }
  fs.writeFileSync(seenPath, JSON.stringify(seen, null, 2) + '\n');
  console.log(`Marked ${added} URLs as seen in data/discovery-seen.json`);
}

const args = parseArgs(process.argv);
if (args.cmd === 'collect') {
  await runCollect(args);
} else if (args.cmd === 'mark-seen') {
  runMarkSeen(args);
} else {
  console.error(`Unknown subcommand: ${args.cmd}. Expected 'collect' or 'mark-seen'.`);
  process.exit(1);
}

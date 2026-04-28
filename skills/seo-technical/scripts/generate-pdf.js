#!/usr/bin/env node
/**
 * Technical SEO Audit — PDF Generator
 * Usage: node generate-pdf.js <audit-data.json> [output.pdf]
 *
 * Sections:
 *   Pages 1-2  → Executive Report (for client)
 *   Pages 3+   → Technical Detail + Roadmap (for dev team)
 */

const fs   = require('fs');
const path = require('path');

async function getPuppeteer() {
  try {
    return require('puppeteer');
  } catch {
    const { execSync } = require('child_process');
    console.log('[PDF] puppeteer not found — installing...');
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    return require('puppeteer');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function scoreStatus(score) {
  if (score >= 80) return 'PASS';
  if (score >= 50) return 'WARN';
  return 'FAIL';
}

function severityColor(sev) {
  return { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#94A3B8' }[sev] ?? '#94A3B8';
}

function sprintColor(sprint) {
  return { sprint0: '#8B5CF6', sprint1: '#EF4444', sprint2: '#F97316', sprint3: '#3B82F6', backlog: '#64748B' }[sprint] ?? '#64748B';
}

function sprintLabel(sprint) {
  return { sprint0: '⚡ Sprint 0 — Quick Wins', sprint1: '🔴 Sprint 1 — Critical', sprint2: '🟠 Sprint 2 — High Priority', sprint3: '🔵 Sprint 3 — Medium Priority', backlog: '⬜ Backlog' }[sprint] ?? sprint;
}

// SVG half-gauge
function gauge(score) {
  const color = scoreColor(score);
  const r = 90;
  const circ = Math.PI * r; // half-circle circumference ≈ 282.7
  const offset = circ * (1 - score / 100);
  return `
    <svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 120 A ${r} ${r} 0 0 1 220 120"
            fill="none" stroke="#1E293B" stroke-width="20" stroke-linecap="round"/>
      <path d="M 20 120 A ${r} ${r} 0 0 1 220 120"
            fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round"
            stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
      <text x="120" y="108" text-anchor="middle"
            font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
            font-size="48" font-weight="800" fill="${color}">${score}</text>
      <text x="120" y="128" text-anchor="middle"
            font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
            font-size="13" fill="#64748B">/ 100</text>
    </svg>`;
}

// Horizontal bar chart row
function barRow(cat) {
  const color = scoreColor(cat.score);
  const status = scoreStatus(cat.score);
  return `
    <div class="bar-row">
      <span class="bar-label">${cat.name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${cat.score}%;background:${color}"></div>
      </div>
      <span class="bar-num" style="color:${color}">${cat.score}</span>
      <span class="pill" style="background:${color}22;color:${color}">${status}</span>
      ${cat.isQuickWin ? '<span class="pill" style="background:#8B5CF622;color:#8B5CF6">⚡</span>' : ''}
    </div>`;
}

// Radar SVG (10 axes)
function radarSVG(categories) {
  const cx = 160, cy = 160, r = 130;
  const n = categories.length;
  const angles = categories.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPaths = gridLevels.map(level => {
    const pts = angles.map(a => `${(cx + r * level * Math.cos(a)).toFixed(1)},${(cy + r * level * Math.sin(a)).toFixed(1)}`);
    return `<polygon points="${pts.join(' ')}" fill="none" stroke="#1E293B" stroke-width="1"/>`;
  }).join('');

  const axes = angles.map((a, i) => {
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a)).toFixed(1);
    const lx = (cx + (r + 22) * Math.cos(a)).toFixed(1);
    const ly = (cy + (r + 22) * Math.sin(a)).toFixed(1);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#1E293B" stroke-width="1"/>
            <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
                  font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                  font-size="9" fill="#64748B">${categories[i].name.replace('AI Visibility', 'AI').replace('Structured Data', 'Schema').replace('JS Rendering', 'JS').replace('URL Structure', 'URL').replace('Core Web Vitals', 'CWV')}</text>`;
  }).join('');

  const dataPts = categories.map((cat, i) => {
    const ratio = cat.score / 100;
    return `${(cx + r * ratio * Math.cos(angles[i])).toFixed(1)},${(cy + r * ratio * Math.sin(angles[i])).toFixed(1)}`;
  });
  const dataPath = `<polygon points="${dataPts.join(' ')}" fill="#3B82F640" stroke="#3B82F6" stroke-width="2"/>`;
  const dots = dataPts.map((pt, i) => {
    const [x, y] = pt.split(',');
    return `<circle cx="${x}" cy="${y}" r="4" fill="${scoreColor(categories[i].score)}"/>`;
  }).join('');

  return `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
    ${gridPaths}${axes}${dataPath}${dots}
  </svg>`;
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function buildHTML(data) {
  const { domain, url, auditDate, overallScore, categories, roadmap, aiVisibility } = data;
  const overallColor = scoreColor(overallScore);
  const topIssues = categories.flatMap(c => (c.issues || []).map(i => ({ ...i, category: c.name }))).filter(i => i.severity === 'Critical' || i.severity === 'High').slice(0, 5);
  const quickWins  = categories.flatMap(c => (c.issues || []).filter(i => i.isQuickWin).map(i => ({ ...i, category: c.name }))).slice(0, 6);

  const sprintKeys = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'backlog'];

  // Technical detail pages (one per category)
  const techPages = categories.map(cat => {
    const issues = (cat.issues || []);
    const issueRows = issues.map(issue => `
      <div class="issue-card">
        <div class="issue-header">
          <span class="sev-badge" style="background:${severityColor(issue.severity)}22;color:${severityColor(issue.severity)}">${issue.severity}</span>
          ${issue.isQuickWin ? '<span class="sev-badge" style="background:#8B5CF622;color:#8B5CF6">⚡ Quick Win</span>' : ''}
          <span class="issue-title">${issue.title}</span>
        </div>
        ${issue.description ? `<p class="issue-desc">${issue.description}</p>` : ''}
        ${issue.fix ? `<div class="fix-block"><span class="fix-label">FIX</span><code>${issue.fix}</code></div>` : ''}
        ${issue.effort ? `<span class="effort-tag">⏱ ${issue.effort}</span>` : ''}
      </div>`).join('');

    return `
      <div class="page tech-page">
        <div class="tech-header" style="border-left:5px solid ${scoreColor(cat.score)}">
          <div>
            <div class="cat-tag">Category ${categories.indexOf(cat) + 1}</div>
            <h2 class="tech-title">${cat.name}</h2>
          </div>
          <div class="tech-score-block">
            <span class="tech-score-num" style="color:${scoreColor(cat.score)}">${cat.score}</span>
            <span class="tech-score-label">/100</span>
            <span class="pill" style="background:${scoreColor(cat.score)}22;color:${scoreColor(cat.score)}">${scoreStatus(cat.score)}</span>
          </div>
        </div>
        <div class="issue-list">${issues.length ? issueRows : '<p class="no-issues">✅ No issues found in this category.</p>'}</div>
        <div class="page-footer"><span>${domain}</span><span>Technical SEO Audit · ${auditDate}</span><span>Confidential</span></div>
      </div>`;
  }).join('');

  // Roadmap page
  const roadmapCards = sprintKeys.map(key => {
    const items = (roadmap?.[key] || []);
    if (!items.length) return '';
    const color = sprintColor(key);
    const rows = items.map(i => `
      <div class="rm-item">
        <span class="rm-cat">${i.category || ''}</span>
        <span class="rm-title">${i.title}</span>
        ${i.effort ? `<span class="rm-effort">${i.effort}</span>` : ''}
      </div>`).join('');
    return `
      <div class="sprint-card" style="border-top:4px solid ${color}">
        <div class="sprint-label" style="color:${color}">${sprintLabel(key)}</div>
        ${rows}
      </div>`;
  }).filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif; background: #fff; color: #0F172A; }

  /* ── Pages ── */
  .page { width: 794px; min-height: 1123px; position: relative; page-break-after: always; overflow: hidden; padding: 0; }

  /* ── Cover ── */
  .cover { background: #0F172A; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; }
  .cover-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #3B82F6; text-transform: uppercase; margin-bottom: 12px; }
  .cover-domain { font-size: 38px; font-weight: 800; color: #fff; margin-bottom: 4px; }
  .cover-url { font-size: 13px; color: #475569; margin-bottom: 40px; }
  .cover-gauge { margin-bottom: 8px; }
  .cover-score-label { font-size: 13px; color: #64748B; margin-bottom: 48px; }
  .cover-cats { width: 500px; display: flex; flex-direction: column; gap: 8px; }
  .cover-cat-row { display: flex; align-items: center; gap: 10px; }
  .cover-cat-name { font-size: 11px; color: #64748B; width: 130px; text-align: right; }
  .cover-cat-track { flex: 1; height: 6px; background: #1E293B; border-radius: 3px; overflow: hidden; }
  .cover-cat-fill { height: 100%; border-radius: 3px; }
  .cover-cat-num { font-size: 11px; font-weight: 700; width: 28px; text-align: right; }
  .cover-footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 18px 40px; background: #0B1120; display: flex; justify-content: space-between; font-size: 11px; color: #334155; }

  /* ── Executive ── */
  .exec-page { padding: 52px 48px; display: flex; flex-direction: column; gap: 32px; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #3B82F6; text-transform: uppercase; margin-bottom: 16px; }
  h2.page-title { font-size: 26px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
  .exec-row { display: flex; gap: 32px; align-items: flex-start; }
  .exec-bars { flex: 1; display: flex; flex-direction: column; gap: 9px; }
  .bar-row { display: flex; align-items: center; gap: 8px; }
  .bar-label { font-size: 11px; color: #475569; width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar-track { flex: 1; height: 8px; background: #F1F5F9; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width .3s; }
  .bar-num { font-size: 12px; font-weight: 700; width: 28px; text-align: right; }
  .pill { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px; white-space: nowrap; }
  .exec-radar { flex-shrink: 0; }

  /* Top issues */
  .issues-grid { display: flex; flex-direction: column; gap: 8px; }
  .top-issue { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: 8px; background: #F8FAFC; border-left: 4px solid; }
  .top-issue-cat { font-size: 10px; color: #94A3B8; margin-bottom: 2px; }
  .top-issue-title { font-size: 13px; font-weight: 600; color: #0F172A; }
  .top-issue-fix { font-size: 11px; color: #475569; margin-top: 3px; }

  /* Quick wins */
  .qw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .qw-card { padding: 12px 14px; background: #F5F3FF; border-radius: 8px; border-left: 3px solid #8B5CF6; }
  .qw-cat { font-size: 10px; color: #8B5CF6; font-weight: 600; margin-bottom: 2px; }
  .qw-title { font-size: 12px; font-weight: 600; color: #0F172A; }
  .qw-effort { font-size: 10px; color: #6B7280; margin-top: 4px; }

  /* AI Visibility summary */
  .ai-box { background: #EFF6FF; border-radius: 10px; padding: 18px 22px; display: flex; gap: 32px; }
  .ai-metric { display: flex; flex-direction: column; align-items: center; }
  .ai-metric-val { font-size: 28px; font-weight: 800; color: #1D4ED8; }
  .ai-metric-label { font-size: 10px; color: #6B7280; text-align: center; margin-top: 2px; }
  .ai-reco { flex: 1; display: flex; align-items: center; font-size: 12px; color: #1E40AF; line-height: 1.5; }

  /* ── Roadmap page ── */
  .roadmap-page { padding: 52px 48px; }
  .sprint-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
  .sprint-card { background: #F8FAFC; border-radius: 10px; padding: 16px; }
  .sprint-label { font-size: 11px; font-weight: 700; margin-bottom: 12px; }
  .rm-item { display: flex; flex-direction: column; gap: 2px; padding: 8px 0; border-bottom: 1px solid #E2E8F0; }
  .rm-item:last-child { border-bottom: none; }
  .rm-cat { font-size: 9px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
  .rm-title { font-size: 12px; color: #1E293B; font-weight: 500; }
  .rm-effort { font-size: 10px; color: #64748B; margin-top: 2px; }

  /* ── Technical detail pages ── */
  .tech-page { padding: 44px 48px 60px; display: flex; flex-direction: column; }
  .tech-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 20px; background: #F8FAFC; border-radius: 8px; margin-bottom: 28px; }
  .cat-tag { font-size: 10px; font-weight: 700; color: #94A3B8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  h2.tech-title { font-size: 22px; font-weight: 800; color: #0F172A; }
  .tech-score-block { display: flex; align-items: baseline; gap: 6px; }
  .tech-score-num { font-size: 40px; font-weight: 800; }
  .tech-score-label { font-size: 14px; color: #94A3B8; }
  .issue-list { display: flex; flex-direction: column; gap: 14px; flex: 1; }
  .issue-card { padding: 14px 16px; border-radius: 8px; border: 1px solid #E2E8F0; background: #fff; }
  .issue-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
  .sev-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; white-space: nowrap; }
  .issue-title { font-size: 13px; font-weight: 700; color: #0F172A; }
  .issue-desc { font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 8px; }
  .fix-block { display: flex; align-items: flex-start; gap: 8px; background: #F1F5F9; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; }
  .fix-label { font-size: 9px; font-weight: 800; color: #3B82F6; letter-spacing: 1px; padding-top: 2px; flex-shrink: 0; }
  code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace; font-size: 11px; color: #1E293B; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
  .effort-tag { font-size: 10px; color: #64748B; }
  .no-issues { font-size: 14px; color: #10B981; font-weight: 600; padding: 20px 0; }

  /* ── Footer ── */
  .page-footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 48px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 10px; color: #94A3B8; background: #fff; }

  @media print {
    .page { page-break-after: always; }
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════ PAGE 1: COVER -->
<div class="page cover">
  <div class="cover-eyebrow">Technical SEO Audit</div>
  <div class="cover-domain">${domain}</div>
  <div class="cover-url">${url}</div>
  <div class="cover-gauge">${gauge(overallScore)}</div>
  <div class="cover-score-label" style="color:${overallColor};font-weight:700;font-size:14px">Overall Score — ${scoreStatus(overallScore)}</div>

  <div class="cover-cats">
    ${categories.map(cat => `
      <div class="cover-cat-row">
        <span class="cover-cat-name">${cat.name}</span>
        <div class="cover-cat-track"><div class="cover-cat-fill" style="width:${cat.score}%;background:${scoreColor(cat.score)}"></div></div>
        <span class="cover-cat-num" style="color:${scoreColor(cat.score)}">${cat.score}</span>
      </div>`).join('')}
  </div>

  <div class="cover-footer">
    <span>Prepared for ${domain}</span>
    <span>Technical SEO Audit</span>
    <span>${auditDate} · Confidential</span>
  </div>
</div>

<!-- ═══════════════════════════════════════════ PAGE 2: EXECUTIVE SUMMARY -->
<div class="page exec-page">
  <div>
    <div class="section-title">Executive Summary</div>
    <h2 class="page-title">Category Scorecard</h2>
  </div>

  <div class="exec-row">
    <div class="exec-bars">
      ${categories.map(cat => barRow(cat)).join('')}
    </div>
    <div class="exec-radar">
      ${radarSVG(categories)}
    </div>
  </div>

  ${topIssues.length ? `
  <div>
    <div class="section-title">Top Issues</div>
    <div class="issues-grid">
      ${topIssues.map(issue => `
        <div class="top-issue" style="border-color:${severityColor(issue.severity)}">
          <div style="flex:1">
            <div class="top-issue-cat">${issue.category} · ${issue.severity}</div>
            <div class="top-issue-title">${issue.title}</div>
            ${issue.fix ? `<div class="top-issue-fix">→ ${issue.fix}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>
  </div>` : ''}

  ${quickWins.length ? `
  <div>
    <div class="section-title">⚡ Quick Wins — High Impact, Low Effort</div>
    <div class="qw-grid">
      ${quickWins.map(qw => `
        <div class="qw-card">
          <div class="qw-cat">${qw.category}</div>
          <div class="qw-title">${qw.title}</div>
          ${qw.effort ? `<div class="qw-effort">⏱ ${qw.effort}</div>` : ''}
        </div>`).join('')}
    </div>
  </div>` : ''}

  ${aiVisibility ? `
  <div>
    <div class="section-title">AI Search Visibility (GEO)</div>
    <div class="ai-box">
      <div class="ai-metric">
        <span class="ai-metric-val">${aiVisibility.citabilityScore ?? '—'}</span>
        <span class="ai-metric-label">Citability<br>Score</span>
      </div>
      <div class="ai-metric">
        <span class="ai-metric-val" style="color:${aiVisibility.llmsTxt ? '#10B981' : '#EF4444'}">${aiVisibility.llmsTxt ? '✓' : '✗'}</span>
        <span class="ai-metric-label">llms.txt</span>
      </div>
      <div class="ai-metric">
        <span class="ai-metric-val" style="color:${(aiVisibility.blockedCrawlers?.length ?? 0) > 0 ? '#F59E0B' : '#10B981'}">${aiVisibility.blockedCrawlers?.length ?? 0}</span>
        <span class="ai-metric-label">Crawlers<br>Blocked</span>
      </div>
      <div class="ai-reco">💡 ${aiVisibility.topRecommendation ?? 'No recommendation available.'}</div>
    </div>
  </div>` : ''}

  <div class="page-footer"><span>${domain}</span><span>Technical SEO Audit · ${auditDate}</span><span>Confidential</span></div>
</div>

<!-- ═══════════════════════════════════════════ PAGE 3: ROADMAP -->
<div class="page roadmap-page">
  <div class="section-title">Implementation Roadmap</div>
  <h2 class="page-title">Sprint Plan</h2>
  <div class="sprint-grid">${roadmapCards}</div>
  <div class="page-footer"><span>${domain}</span><span>Technical SEO Audit · ${auditDate}</span><span>Confidential</span></div>
</div>

<!-- ═══════════════════════════════════════════ PAGES 4+: TECHNICAL DETAIL -->
${techPages}

</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const inputFile  = process.argv[2];
  const outputFile = process.argv[3] ?? inputFile?.replace(/\.json$/, '.pdf') ?? 'audit-report.pdf';

  if (!inputFile) {
    console.error('Usage: node generate-pdf.js <audit-data.json> [output.pdf]');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`[PDF] File not found: ${inputFile}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const html = buildHTML(data);

  console.log('[PDF] Launching browser...');
  const puppeteer = await getPuppeteer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await page.pdf({
    path: outputFile,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
  console.log(`[PDF] Report saved → ${outputFile}`);
}

main().catch(err => { console.error('[PDF] Error:', err.message); process.exit(1); });

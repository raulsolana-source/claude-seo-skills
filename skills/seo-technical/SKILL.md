---
name: seo-technical
description: >
  Technical SEO orchestrator. Spawns parallel specialist agents across 10 audit
  categories and consolidates results into a prioritized roadmap. Use when user
  says "technical SEO audit", "full site audit", "SEO roadmap", or "crawl issues".
user-invokable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: raulsolana-source
  version: "2.1.0"
  category: seo
---

# Technical SEO Audit — Orchestrator

## Role

You are the orchestrator. Your job is NOT to audit directly. Your job is to:
1. Spawn 10 specialist agents in parallel
2. Wait for all results
3. Consolidate into a single scored report + prioritized roadmap
4. Generate a visual PDF via the report script

---

## Step 1 — Launch Parallel Agents

Spawn all 10 agents simultaneously using the Agent tool. Each receives the target URL and its specific mandate. Do not wait for one to finish before starting the next.

### Agent 1: Crawlability
**Mission:** Audit robots.txt, XML sitemap, crawl depth, noindex usage, and AI crawler access (GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Bytespider, Google-Extended, CCBot). Flag any AI crawlers that are blocked and distinguish training crawlers from search crawlers.
**Output:** Score 0-100, list of issues with severity (Critical/High/Medium/Low).

### Agent 2: Indexability
**Mission:** Audit canonical tags, duplicate content, thin content, pagination, index bloat, and hreflang implementation (bidirectionality, x-default, consistency across HTML/headers/sitemap).
**Output:** Score 0-100, list of issues with severity.

### Agent 3: Security
**Mission:** Audit HTTPS enforcement, SSL certificate validity and expiry (flag if <30 days), mixed content, and security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
**Output:** Score 0-100, list of issues with severity.

### Agent 4: URL Structure
**Mission:** Audit URL cleanliness, logical hierarchy, redirect chains (flag >1 hop), URL length (flag >100 chars), trailing slash consistency, and uppercase characters in URLs.
**Output:** Score 0-100, list of issues with severity.

### Agent 5: Mobile Optimization
**Mission:** Audit viewport meta tag, responsive design, touch targets (min 48x48px), font size (min 16px), horizontal scroll. Note: Google has used mobile-first indexing exclusively since July 5, 2024.
**Output:** Score 0-100, list of issues with severity.

### Agent 6: Core Web Vitals
**Mission:** Audit LCP (<2.5s), INP (<200ms, replaced FID March 2024), CLS (<0.1) using 75th percentile real user data. Use PageSpeed Insights or CrUX if available. Flag pages without CrUX data.
**Output:** Score 0-100, per-metric status, list of issues with severity.

### Agent 7: Structured Data
**Mission:** Detect JSON-LD, Microdata, RDFa. Validate against Google's supported schema types. Check required vs recommended properties. Flag structured data served only via JavaScript.
**Output:** Score 0-100, schemas found, list of issues with severity.

### Agent 8: JavaScript Rendering
**Mission:** Identify CSR vs SSR. Detect SPA frameworks. Verify critical SEO elements (canonical, meta robots, title, structured data) are in server-rendered HTML. Apply December 2025 Google JS SEO guidance: canonical conflicts, noindex via JS, non-200 + JS rendering, delayed structured data.
**Output:** Score 0-100, rendering type, list of issues with severity.

### Agent 9: IndexNow Protocol
**Mission:** Check if IndexNow is implemented (key file at root or x-robots-tag header). Verify compatibility with Bing, Yandex, Naver.
**Output:** Score 0-100, implementation status, list of issues with severity.

### Agent 10: AI Search Visibility (GEO)
**Mission:** Audit llms.txt presence and format at root domain. Check AI crawler access for search crawlers (ChatGPT-User, PerplexityBot) specifically. Evaluate content citability: passage-level clarity, question-format headers, factual density, author expertise signals. Check E-E-A-T schema: Person, Organization, Article with dateModified.
**Output:** Score 0-100, llms.txt status, citability assessment, list of issues with severity.

---

## Step 2 — Consolidate Results

Once all 10 agents return, aggregate into a single structured report.

### Scoring

Calculate the overall Technical SEO Score:

```
Overall Score = weighted average of 10 category scores

Weights:
- Crawlability:        15%
- Indexability:        15%
- Security:            10%
- URL Structure:        8%
- Mobile:              10%
- Core Web Vitals:     12%
- Structured Data:      8%
- JS Rendering:        10%
- IndexNow:             2%
- AI Visibility (GEO): 10%
```

---

## Step 3 — Output

### Technical SEO Score: XX/100

### Category Breakdown
| # | Category | Score | Status | Quick Win |
|---|----------|-------|--------|-----------|
| 1 | Crawlability | XX/100 | ✅/⚠️/❌ | yes/no |
| 2 | Indexability | XX/100 | ✅/⚠️/❌ | yes/no |
| 3 | Security | XX/100 | ✅/⚠️/❌ | yes/no |
| 4 | URL Structure | XX/100 | ✅/⚠️/❌ | yes/no |
| 5 | Mobile | XX/100 | ✅/⚠️/❌ | yes/no |
| 6 | Core Web Vitals | XX/100 | ✅/⚠️/❌ | yes/no |
| 7 | Structured Data | XX/100 | ✅/⚠️/❌ | yes/no |
| 8 | JS Rendering | XX/100 | ✅/⚠️/❌ | yes/no |
| 9 | IndexNow | XX/100 | ✅/⚠️/❌ | yes/no |
| 10 | AI Visibility | XX/100 | ✅/⚠️/❌ | yes/no |

**Score legend:** ✅ 80-100 · ⚠️ 50-79 · ❌ 0-49
**Quick Win:** fix takes <2 hours with high SEO impact.

---

### SEO Technical Roadmap

#### Sprint 0 — Quick Wins (this week, <2h each)
For each: **[Category]** · Issue · Exact fix · Expected impact

#### Sprint 1 — Critical (block rankings or indexing)
For each: **[Category]** · Issue · Exact fix · Effort estimate · Expected impact

#### Sprint 2 — High Priority (within 1 month)
For each: **[Category]** · Issue · Exact fix · Effort estimate

#### Sprint 3 — Medium Priority (next quarter)
For each: **[Category]** · Issue · Exact fix · Effort estimate

#### Backlog — Low Priority
Brief list only.

---

### AI Visibility Summary
- llms.txt: present ✅ / missing ❌
- Search AI crawlers blocked: [list or "none"]
- Citability score: XX/100
- Top recommendation: [one specific action]

### Recommended Next Skills
- `seo-schema` — deep structured data audit
- `seo-geo` — full AI visibility and GEO optimization
- `seo-content` — E-E-A-T and content quality

### Re-audit Recommendation
[X weeks/months based on severity of issues found]

---

## Step 3 — Generate PDF Report

After consolidating all results, produce a visual PDF covering both audiences:
- **Executive section** (pages 1-2): score gauge, category scorecard, top issues, quick wins, AI visibility summary
- **Technical section** (pages 3+): sprint roadmap, per-category detail with exact fixes

### Step 3a — Write JSON data file

Write a file named `technical-seo-[domain]-[YYYY-MM-DD].json` in the current working directory with this exact structure:

```json
{
  "domain": "example.com",
  "url": "https://example.com",
  "auditDate": "YYYY-MM-DD",
  "overallScore": 72,
  "categories": [
    {
      "name": "Crawlability",
      "score": 85,
      "weight": 15,
      "isQuickWin": false,
      "issues": [
        {
          "severity": "High",
          "title": "Short title of the issue",
          "description": "Brief explanation of why this matters (1-2 sentences).",
          "fix": "Exact command, config snippet, or action to resolve it.",
          "effort": "30 min",
          "isQuickWin": false
        }
      ]
    }
  ],
  "roadmap": {
    "sprint0": [{ "category": "Security", "title": "Add HSTS header", "effort": "15 min" }],
    "sprint1": [{ "category": "Crawlability", "title": "Fix robots.txt blocking /api", "effort": "1 h" }],
    "sprint2": [],
    "sprint3": [],
    "backlog": []
  },
  "aiVisibility": {
    "llmsTxt": false,
    "blockedCrawlers": ["GPTBot"],
    "citabilityScore": 45,
    "topRecommendation": "Create llms.txt and unblock ChatGPT-User to enable AI search citations."
  }
}
```

**Category order and weights must be:**
Crawlability (15%), Indexability (15%), Security (10%), URL Structure (8%), Mobile (10%), Core Web Vitals (12%), Structured Data (8%), JS Rendering (10%), IndexNow (2%), AI Visibility (10%).

### Step 3b — Run the PDF generator

Once the JSON file is written, run:

```bash
cd skills/seo-technical/scripts && npm install --silent && node generate-pdf.js ../../../technical-seo-[domain]-[date].json
```

The script will:
1. Auto-install Puppeteer if needed
2. Render a multi-page A4 PDF with cover, executive summary, roadmap, and per-category technical pages
3. Save as `technical-seo-[domain]-[date].pdf` next to the JSON file

Report the output PDF path to the user when done.

---

## Error Handling

| Scenario | Action |
|----------|--------|
| URL unreachable | Report error. Skip all agents. Return connection diagnosis. |
| Agent returns no data | Mark category as "Unable to audit" and exclude from score calculation. |
| CWV data unavailable | Use Lighthouse lab data. Note it is lab data, not field data. |
| llms.txt not found | Flag as Medium priority. Include template in roadmap. |
| AI crawler blocked | Flag severity based on whether it is a search crawler (High) or training-only crawler (Low-Medium). |

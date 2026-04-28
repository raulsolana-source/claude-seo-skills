---
name: seo-technical
description: >
  Technical SEO audit across 10 categories: crawlability, indexability, security,
  URL structure, mobile, Core Web Vitals, structured data, JavaScript rendering,
  IndexNow protocol, and AI Search Visibility (GEO). Use when user says "technical SEO",
  "crawl issues", "robots.txt", "Core Web Vitals", "site speed", "security headers",
  "AI visibility", or "GEO audit".
user-invokable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: raulsolana-source
  version: "2.0.0"
  based-on: AgriciDaniel/claude-seo@1.9.6
  category: seo
---

# Technical SEO Audit

## Categories

### 1. Crawlability
- robots.txt: exists, valid, not blocking important resources
- XML sitemap: exists, referenced in robots.txt, valid format, no broken URLs, last modified date
- Noindex tags: intentional vs accidental
- Crawl depth: important pages within 3 clicks of homepage
- JavaScript rendering: check if critical content requires JS execution
- Crawl budget: for large sites (>10k pages), efficiency matters
- Internal search pages: ensure ?q= parameters are blocked or noindexed

#### AI Crawler Management

As of 2025-2026, AI companies actively crawl the web to train models and power AI search. Managing these crawlers via robots.txt is a critical technical SEO consideration — especially for brands that want AI visibility.

**Known AI crawlers:**

| Crawler | Company | robots.txt token | Purpose |
|---------|---------|-----------------|---------|
| GPTBot | OpenAI | `GPTBot` | Model training |
| ChatGPT-User | OpenAI | `ChatGPT-User` | Real-time browsing |
| ClaudeBot | Anthropic | `ClaudeBot` | Model training |
| PerplexityBot | Perplexity | `PerplexityBot` | Search index + training |
| Bytespider | ByteDance | `Bytespider` | Model training |
| Google-Extended | Google | `Google-Extended` | Gemini training (NOT search) |
| CCBot | Common Crawl | `CCBot` | Open dataset |

**Key distinctions:**
- Blocking `Google-Extended` prevents Gemini training but does NOT affect Google Search or AI Overviews (those use `Googlebot`)
- Blocking `GPTBot` prevents OpenAI training but does NOT prevent ChatGPT from citing via browsing (`ChatGPT-User`)
- ~3-5% of websites now use AI-specific robots.txt rules

**Strategic recommendation:** Before blocking AI crawlers, assess your AI visibility goals. Cross-reference **Category 10 (AI Search Visibility)** for full GEO optimization.

### 2. Indexability
- Canonical tags: self-referencing, no conflicts with noindex
- Duplicate content: near-duplicates, parameter URLs, www vs non-www
- Thin content: pages below minimum word counts per type
- Pagination: rel=next/prev or load-more pattern
- Index bloat: unnecessary pages consuming crawl budget
- Faceted navigation: parameter URLs being indexed unintentionally

#### Hreflang
- Correct implementation for multi-language/multi-region sites
- `x-default` tag presence for language selector pages
- Bidirectional hreflang: every alternate URL must reference back
- No hreflang on noindexed or redirected pages
- Consistent hreflang across HTML, HTTP headers, and sitemap

### 3. Security
- HTTPS: enforced, valid SSL certificate, no mixed content
- Security headers:
  - Content-Security-Policy (CSP)
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
- HSTS preload: check preload list inclusion for high-security sites
- Certificate expiry: flag certs expiring within 30 days

### 4. URL Structure
- Clean URLs: descriptive, hyphenated, no query parameters for content
- Hierarchy: logical folder structure reflecting site architecture
- Redirects: no chains (max 1 hop), 301 for permanent moves
- URL length: flag >100 characters
- Trailing slashes: consistent usage
- Uppercase characters: flag any uppercase in URLs (case-sensitive on most servers)

### 5. Mobile Optimization
- Responsive design: viewport meta tag, responsive CSS
- Touch targets: minimum 48x48px with 8px spacing
- Font size: minimum 16px base
- No horizontal scroll
- Mobile-first indexing: **100% complete as of July 5, 2024.** Google crawls ALL websites exclusively with mobile Googlebot. The mobile version is what gets indexed.

### 6. Core Web Vitals
- **LCP** (Largest Contentful Paint): target <2.5s
  - Check: image optimization, render-blocking resources, server response time
- **INP** (Interaction to Next Paint): target <200ms
  - INP replaced FID on **March 12, 2024**. Do NOT reference FID — it was fully removed from CrUX API and PageSpeed Insights on September 9, 2024.
  - INP-specific checks: heavy JavaScript on main thread, long tasks, event handler efficiency
- **CLS** (Cumulative Layout Shift): target <0.1
  - Check: images without dimensions, dynamically injected content, web fonts
- Evaluation uses 75th percentile of real user data (CrUX)
- Use PageSpeed Insights API or CrUX data if MCP available
- Flag pages with no CrUX data (low traffic) — use Lighthouse lab data as proxy

### 7. Structured Data
- Detection: JSON-LD (preferred), Microdata, RDFa
- Validation against Google's supported schema types
- Check for required vs recommended properties per schema type
- Warning: structured data in JavaScript may face delayed processing (see Category 8)
- See seo-schema skill for full structured data analysis

### 8. JavaScript Rendering
- Check if content visible in initial HTML vs requires JS execution
- Identify CSR (client-side rendering) vs SSR (server-side rendering)
- Flag SPA frameworks (React, Vue, Angular, Next.js, Nuxt) that may cause indexing delays

#### JavaScript SEO: Critical Guidance (December 2025 Update)

Google updated its JavaScript SEO documentation in December 2025 with these critical clarifications:

1. **Canonical conflicts:** If canonical in raw HTML differs from one injected by JavaScript, Google may use EITHER one. Canonical tags must be identical between server-rendered HTML and JS-rendered output.
2. **noindex with JavaScript:** If raw HTML contains `<meta name="robots" content="noindex">` but JavaScript removes it, Google MAY still honor the noindex from raw HTML. Always serve correct robots directives in initial HTML.
3. **Non-200 status codes:** Google does NOT render JavaScript on pages returning non-200 HTTP status. Any content injected via JS on error pages is invisible to Googlebot.
4. **Structured data in JavaScript:** Especially for e-commerce Product markup — include in server-rendered HTML for reliable and timely processing.

**Best practice:** Serve all critical SEO elements (canonical, meta robots, structured data, title, meta description) in the initial server-rendered HTML.

### 9. IndexNow Protocol
- Check if site supports IndexNow for Bing, Yandex, and Naver
- Verify `indexnow-[key].txt` file at root or `x-robots-tag: indexnow-key` in headers
- Supported by all major non-Google search engines
- Recommend implementation for faster indexing on non-Google engines

### 10. AI Search Visibility (GEO)

Generative Engine Optimization (GEO) ensures your content is cited and recommended by AI-powered search systems: ChatGPT, Perplexity, Google AI Overviews, Bing Copilot, and Claude.

#### llms.txt
- Check if `/llms.txt` exists at the root domain
- Valid format: Markdown file listing key URLs + brief descriptions for AI crawlers
- Example structure:
  ```
  # Brand Name
  > One-line description of what this site offers

  ## Key Pages
  - [Product page](https://example.com/product): Brief description
  - [About](https://example.com/about): Company background
  ```
- Also check for `/llms-full.txt` for extended context

#### AI Crawler Access
- Verify AI crawlers are NOT blanket-blocked in robots.txt (unless intentional)
- Check `ChatGPT-User` and `PerplexityBot` specifically — these power real-time AI search responses
- Distinguish between training crawlers (GPTBot) and search crawlers (ChatGPT-User)

#### Content Citability
- Passage-level clarity: key facts, stats, and definitions in standalone paragraphs (easy to extract)
- Headers that answer questions directly (H2/H3 as FAQ-style queries)
- Factual density: data, dates, named entities — AI prefers citable specifics over prose
- Author expertise signals: bylines with credentials, About page with author schema
- Freshness: updated dates visible and accurate (AI systems prioritize recent content)

#### E-E-A-T Technical Signals
- Author schema (`Person` type with `name`, `url`, `jobTitle`, `knowsAbout`)
- Organization schema with `foundingDate`, `sameAs` (social profiles)
- Article schema with `dateModified` (must match visible "last updated" date)
- About page: organization background, team, credentials
- Contact page: real contact info, not just a form

#### Brand Mentions & Entity Recognition
- Check if brand appears in structured data as a named entity
- NAP consistency (Name, Address, Phone) across all pages if local business
- Consistent brand name spelling across site (AI builds entity associations from consistency)

---

## Output

### Technical Score: XX/100

### Category Breakdown
| Category | Status | Score | Quick Win? |
|----------|--------|-------|------------|
| Crawlability | pass/warn/fail | XX/100 | yes/no |
| Indexability | pass/warn/fail | XX/100 | yes/no |
| Security | pass/warn/fail | XX/100 | yes/no |
| URL Structure | pass/warn/fail | XX/100 | yes/no |
| Mobile | pass/warn/fail | XX/100 | yes/no |
| Core Web Vitals | pass/warn/fail | XX/100 | yes/no |
| Structured Data | pass/warn/fail | XX/100 | yes/no |
| JS Rendering | pass/warn/fail | XX/100 | yes/no |
| IndexNow | pass/warn/fail | XX/100 | yes/no |
| AI Visibility (GEO) | pass/warn/fail | XX/100 | yes/no |

**Quick Win** = fix takes <2 hours and has high SEO impact.

### Priority Matrix

#### Critical — Fix Immediately (blocks indexing or rankings)
For each issue: **[Category]** Issue description → Specific fix → Estimated effort

#### High — Fix Within 1 Week (significant ranking impact)
For each issue: **[Category]** Issue description → Specific fix → Estimated effort

#### Medium — Fix Within 1 Month (incremental improvement)

#### Low — Backlog (minor impact or edge cases)

#### Quick Wins (high impact, low effort — do these first)
List issues marked as Quick Win regardless of severity tier.

### Internal Linking Audit
- Total internal links crawled
- Orphan pages detected (no internal links pointing to them)
- Pages with only 1 internal link (near-orphans)
- Most-linked pages (link equity distribution)
- Recommended links to add

### AI Visibility Summary
- llms.txt: present/missing
- AI crawlers blocked: list which ones
- Citability score: 0-100 (based on content structure checks)
- Key recommendation for AI search optimization

### Next Steps
1. Top 3 immediate actions with owner and deadline suggestion
2. Recommended re-audit date: [X weeks/months]
3. Skills to run next: `seo-schema` for structured data depth, `seo-geo` for full AI visibility audit, `seo-content` for E-E-A-T content analysis

---

## DataForSEO Integration (Optional)

If DataForSEO MCP tools are available:
- `on_page_instant_pages`: real page analysis (status codes, timing, broken links, on-page checks)
- `on_page_lighthouse`: Lighthouse audits (performance, accessibility, SEO scores)
- `domain_analytics_technologies_domain_technologies`: technology stack detection

## Google API Integration (Optional)

If Google API credentials are configured:
- `python scripts/pagespeed_check.py <url> --json`: real PSI + CrUX field data
- `python scripts/crux_history.py <url> --json`: 25-week CWV trends
- `python scripts/gsc_inspect.py <url> --json`: real indexation status per URL

## Error Handling

| Scenario | Action |
|----------|--------|
| URL unreachable | Report connection error with status code. Suggest verifying URL, checking DNS resolution, confirming the site is publicly accessible. |
| robots.txt not found | Note no robots.txt detected at root domain. Recommend creating one. Continue audit on remaining categories. |
| HTTPS not configured | Flag as Critical. Report whether HTTP is served without redirect, mixed content exists, or SSL is missing/expired. |
| CWV data unavailable | Note CrUX data not available (common for low-traffic sites). Use Lighthouse lab data as proxy. Recommend increasing traffic before re-testing. |
| llms.txt not found | Flag as Medium priority. Provide template and recommend creating it. |
| AI crawler blocked | Flag as Medium-High depending on business AI visibility goals. Explain training vs search crawler distinction before recommending changes. |

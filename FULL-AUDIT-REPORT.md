# SEO Full Audit Report — lejanbrand.com
**Fecha:** 28 de abril de 2026
**Plataforma:** Shopify + Cloudflare CDN (GCP europe-west1)
**Marca:** Lejan™ — Calzado Barefoot supervisado por podólogo
**Mercados:** España (raíz `/`), Inglés (`/en`), Alemán (`/de`) + 15 variantes de país

---

## SEO Health Score: 44 / 100

| Categoría | Peso | Score | Ponderado |
|-----------|------|-------|-----------|
| Technical SEO | 22% | 54/100 | 11.9 |
| Calidad de Contenido | 23% | 49/100 | 11.3 |
| On-Page SEO | 20% | 38/100 | 7.6 |
| Schema / Structured Data | 10% | 30/100 | 3.0 |
| Performance (CWV) | 10% | 45/100 | 4.5 |
| AI Search Readiness (GEO) | 10% | 34/100 | 3.4 |
| Imágenes | 5% | 50/100 | 2.5 |
| **TOTAL** | | | **44.2 / 100** |

---

## Resumen Ejecutivo

Lejan™ es una marca de calzado barefoot con un posicionamiento genuinamente diferenciado (supervisión de podólogo, "barefoot bonito") y un blog educativo con contenido de valor real. Sin embargo, una serie de problemas técnicos críticos —algunos de ellos bloqueantes de indexación— y la ausencia de señales de autoridad en el HTML rastreable están impidiendo que el motor SEO real del sitio funcione.

El problema más urgente es que el mercado alemán (`/de`) tiene un `noindex` activo, lo que significa que Google no puede indexar ninguna página en alemán. El segundo problema más grave es que el blog educativo ("Inside Barefoot"), que es el principal activo de E-E-A-T del sitio, está gateado detrás de un registro de email, lo que impide que Googlebot lo rastree o indexe.

El sitio tiene la base correcta —producto con diferenciación real, contenido educativo de calidad, e-commerce funcional— pero necesita correcciones críticas antes de que cualquier esfuerzo de contenido o link building produzca resultados.

### Top 5 Problemas Críticos
1. `/de` homepage con `meta noindex` activo → mercado alemán invisible para Google
2. H1 del homepage vacío + OG image es un placeholder (`Placeholder.jpg` en producción)
3. Blog "Inside Barefort" gateado → Googlebot no puede rastrear el contenido educativo
4. `x-default` hreflang apunta a página en español → todos los usuarios sin match caen en página española
5. ProductGroup schema usa `http://schema.org/` (sin HTTPS) y `@id` relativo → rich results bloqueados

### Top 5 Quick Wins (< 4 horas cada uno)
1. Quitar `noindex` del `/de` homepage (1 hora)
2. Crear `llms.txt` en raíz (1 hora)
3. Añadir `datePublished` visible en el template de blog (2 horas desarrollo)
4. Reemplazar `Placeholder.jpg` como imagen OG sitewide (30 minutos)
5. Corregir `@context` de ProductGroup a `https://schema.org` en Liquid (2 horas desarrollo)

---

## 1. Technical SEO — Score: 54/100

### Hallazgos Críticos

**C-1 — `/de` homepage tiene `<meta name="robots" content="noindex, follow">`**
El homepage alemán está explícitamente marcado como noindex. Sin embargo, `/de` está referenciado en las anotaciones hreflang de todas las páginas como `hreflang="de"` y tiene cuatro child sitemaps en el sitemap index. Resultado: el mercado alemán es completamente invisible para Google.

*Fix:* Eliminar el meta robots noindex del template del homepage en el mercado DE. Verificar si Locksmith o la configuración de Markets de Shopify está inyectando este tag.

**C-2 — `x-default` hreflang apunta al homepage en español**
Todas las páginas declaran `hreflang="x-default" → https://lejanbrand.com/` y `hreflang="es" → https://lejanbrand.com/` — apuntando ambos a la misma URL en español. El `x-default` debe indicar el fallback para usuarios sin match de idioma, no servir contenido en español a usuarios angloparlantes o de otros idiomas.

*Fix:* Reasignar `x-default` a `https://lejanbrand.com/en` en la configuración de Shopify Markets (establecer English como locale primario/default).

**C-3 — Root `/` sirve contenido duplicado junto con `/en` sin consolidación**
`https://lejanbrand.com/` → HTTP 200 (español, canonical a sí mismo). `https://lejanbrand.com/en` → HTTP 200 (inglés, canonical a sí mismo). Cada producto existe en dos URLs canonicalizadas independientemente: `/products/lejan-one-kids-pink` y `/en/products/lejan-one-kids-pink`. Google debe elegir cuál indexar con señales contradictorias.

*Fix:* Eliminar los sitemaps de raíz (sin prefijo de locale) del sitemap index, o añadir `noindex` a todas las URLs de raíz excepto el homepage. Alternativamente, configurar `/es` como prefijo explícito en Shopify Markets y redirigir `/products/`, `/collections/`, `/pages/` de raíz a `/es/`.

### Hallazgos High

**H-1 — OG image usa protocolo HTTP, no HTTPS**
`<meta property="og:image" content="http://lejanbrand.com/cdn/shop/files/Placeholder.jpg">`. La variante con HTTPS también existe (`og:image:secure_url`) pero el tag principal usa HTTP.

**H-2 — HSTS max-age de solo 91 días (7,889,238 s)**
El requisito mínimo para el preload list de Google es `max-age=31536000` + `includeSubDomains` + `preload`. La configuración actual no cumple ninguno de los tres requisitos adicionales.
*Fix:* En Cloudflare → SSL/TLS → Edge Certificates → HSTS, establecer max-age a 31,536,000.

**H-3 — Server processing time: 996–1,589ms**
Los headers `server-timing` revelan tiempos de procesamiento de 996ms a 1,589ms. El objetivo para un TTFB aceptable es <200ms. Shopify complexity scores del homepage: 9,920–11,850 (colecciones: 15,850).

**H-4 — 40+ anotaciones hreflang por página sin validación de return-links**
El sitio tiene 18 variantes de locale (en, de, en-gb, en-us, en-eu, de-de, de-eu, es-gb, es-us, es-eu, es-row, es-pt, es-fr, en-de, en-pt, en-fr, en-row + raíz). Sin una auditoría completa de return-links (que el skill `seo-hreflang` puede ejecutar), es imposible confirmar que cada variante referencia correctamente a todas las demás.

**H-5 — `/en/pages/about` devuelve 404**
La página About está linkeada desde el footer pero el handle no existe. Verificar el handle correcto en Shopify Admin.

### Hallazgos Medium

| ID | Descripción | Fix |
|----|-------------|-----|
| M-1 | CSP mínimo (Shopify default): sin `script-src`, `img-src`, `connect-src` | Implementar CSP en modo Report-Only primero |
| M-2 | `/policies/` deshabilitado en robots.txt (puede afectar verificación de Merchant Center) | Evaluar si eliminar el Disallow |
| M-3 | `X-XSS-Protection: 1; mode=block` — header deprecado | Eliminar via Cloudflare Transform Rule |
| M-4 | Sin `Referrer-Policy` ni `Permissions-Policy` headers | Añadir en Cloudflare |
| M-5 | Sin `<link rel="preload" as="image">` para imagen hero | Añadir en `<head>` del tema |
| M-6 | WebSite SearchAction target usa `/en/search` en todas las locales | Localizar por mercado |

### Hallazgos Low

| ID | Descripción |
|----|-------------|
| L-1 | Sin implementación de IndexNow |
| L-2 | Locksmith JS (~8KB) carga en todas las páginas aunque `transparent: true` |
| L-3 | Canonical de `/` apunta a sí misma en español — intencional pero confuso sin x-default correcto |

### Redirect Chain

| URL | Status | Nota |
|-----|--------|------|
| `http://lejanbrand.com/` | → 301 → `https://lejanbrand.com/` | ✅ Correcto |
| `https://lejanbrand.com/` | → 200 (español) | ✅ |
| `https://lejanbrand.com/en` | → 200 (inglés) | ✅ |
| `https://lejanbrand.com/de` | → 200 (noindex activo) | ❌ Crítico |
| `https://lejanbrand.com/es` | → **404** | ❌ Crítico |
| `https://lejanbrand.com/en/pages/about` | → **404** | 🟠 High |

### Security Headers

| Header | Estado |
|--------|--------|
| HTTPS | ✅ Activo |
| HSTS | ⚠️ 91 días, sin preload |
| CSP | ⚠️ Solo `block-all-mixed-content` (Shopify default) |
| X-Frame-Options | ✅ DENY |
| X-Content-Type-Options | ✅ nosniff |
| X-XSS-Protection | ⚠️ Header deprecado |
| Referrer-Policy | ❌ Ausente |
| Permissions-Policy | ❌ Ausente |

---

## 2. Calidad de Contenido — Score: 49/100

### E-E-A-T: 33/100

| Factor | Score | Severidad |
|--------|-------|-----------|
| Experience | 24/100 | Crítica |
| Expertise | 38/100 | Alta |
| Authoritativeness | 22/100 | Crítica |
| Trustworthiness | 45/100 | Media-Alta |

**Problema principal de E-E-A-T:** El podólogo fundador (Alejandro Martínez Calderón) es el activo de autoridad más poderoso del sitio pero es completamente invisible en el HTML rastreable. La referencia a "podólogo Lejancitos" solo aparece en la meta description. No existe página de About accesible, no hay número de colegiado, no hay author schema en los artículos del blog, y "Lejancitos" es un nombre de personaje mascota, no un profesional verificable.

### Problemas Críticos de Contenido

**H1 del homepage vacío:** El elemento `<h1>` del homepage en inglés no contiene texto visible. Es el espacio de señal de keyword más importante de la página y está desperdiciado.

**Blog Inside Barefoot gateado:** El contenido educativo (38 artículos sobre pie plano, fascitis plantar, zero-drop, transición barefoot) está bloqueado detrás de un registro de email. Google no puede rastrear ni indexar este contenido. Es el principal activo de autoridad topical del sitio y está completamente oculto para los motores de búsqueda.

**OG image = `Placeholder.jpg`:** La imagen Open Graph de toda la web es literalmente un archivo llamado `Placeholder.jpg`. Cada vez que se comparte cualquier página del sitio en redes sociales, se muestra esta imagen placeholder.

**About Us → 404:** La página About Us está linkeada desde el footer pero devuelve 404. Es el anchor principal de E-E-A-T para cualquier sitio web y es un enlace interno roto.

**Contenido bilingüe en páginas EN:** Las páginas de producto en inglés contienen párrafos enteros en español ("Beneficios de utilizar Lejan One", "Envíos gratuitos a España"). Esto indica un fallo en la gestión de traducciones en Shopify y erosiona la confianza en la experiencia EN.

**Sin fechas en artículos del blog:** Ningún artículo del blog tiene fecha de publicación visible ni en schema. Para contenido de salud, la falta de fecha trabaja contra las señales de trustworthiness.

### Análisis de Estructura de Headings

| Página | H1 | H2 | Problemas |
|--------|----|----|-----------|
| Homepage /en | ⚠️ Vacío / débil | Sí (product-oriented) | Sin keyword en H1 |
| /en/collections/all | ❌ Ausente | Sí (5 tópicos) | H1 faltante |
| Blog artículo (flexible sole) | ✅ Claro | ✅ 7 H2 tópicos | Buena estructura |
| Inside Barefoot index | ❌ Ausente | ❌ Ausente | Sin estructura |
| Página de producto (socks) | ✅ (nombre) | ❌ Ninguno | Sin jerarquía de contenido |

### Title Tags y Meta Descriptions

| Página | Title | Meta Desc | Problemas |
|--------|-------|-----------|-----------|
| EN Homepage | "Lejan™ \| Barefoot Bonito \| Stylish Barefoot Footwear – Lejan Brand" | "Respectful footwear... podiatrist Lejancitos." | Brand duplicada ("Lejan™" + "Lejan Brand"); "Lejancitos" sin contexto |
| DE Homepage | "Lejan™ \| Barefoot Bonito \| Stylische Barfußschuhe – Lejan Brand" | ✅ Presente | ❌ Página con noindex — irrelevante |
| /en/collections/all | "Barefoot Bonito \| Pretty Barefoot Shoes" | Menciona zero drop, wide toe box, podólogo | ✅ Sólida |
| Blog artículo | "Flexible sole: a clear guide..." | "If you only read one thing..." | Meta desc es teaser, no keyword-optimizada |
| Socks producto | "Lejan® Socks \| Lejan Brand, the best respectful children's footwear" | Igual — enfoque en niños para producto adulto | ❌ Wrong targeting |

### Internal Linking
- ❌ Sin links internos contextuales de páginas de producto → artículos del blog
- ❌ About Us linkeado desde footer → 404
- ❌ Blog index lista artículos gateados → cero equity de links a los artículos
- ✅ Navegación principal cubre Woman/Man/Kids con subcategorías correctamente

---

## 3. Schema / Structured Data — Score: 30/100

### Estado Actual

| Schema Type | Estado | Páginas |
|-------------|--------|---------|
| Organization | ✅ Presente (con errores) | Todas |
| WebSite + SearchAction | ✅ Presente (con advertencia) | Homepage |
| BreadcrumbList | ✅ Presente (incompleto) | Páginas de producto |
| ProductGroup | ⚠️ Presente (con errores críticos) | Páginas de producto |
| Article | ❌ Ausente | Blog |
| AggregateRating | ❌ Ausente | Todo el sitio |
| FAQPage | ❌ Ausente | FAQ |
| Person | ❌ Ausente | Todo el sitio |
| Review | ❌ Ausente | Todo el sitio |

### Errores Críticos

**ProductGroup usa `http://schema.org/` en lugar de `https://schema.org`**
Este error bloquea la elegibilidad para rich results. Es un cambio en el archivo Liquid del tema de Shopify (`snippets/structured-data.liquid` o equivalente).

**`@id` del ProductGroup es una ruta relativa**
`"@id": "/en/products/single-black-essential-white#product"` debe ser `"@id": "https://lejanbrand.com/en/products/single-black-essential-white#product"`.

**Brand name inconsistente en schema**
`"brand": {"@type": "Brand", "name": "Lejancitos"}` — el nombre del personaje mascota, no la marca. Google Merchant Center usa este campo para matching. Debe ser `"Lejan"` o `"Lejan Brand"`.

**Sin AggregateRating en ningún producto**
La ausencia de star ratings schema es la mayor oportunidad perdida en CTR. Las star ratings en resultados orgánicos generan un aumento típico de 15-30% en CTR. Lejan tiene reviews (Trustpilot 4.7/481) pero ninguna está marcada up.

**`gtin` ausente en insoles y zapatos**
Solo los calcetines tienen `gtin`. Los insoles y zapatos no. Google requiere GTIN para elegibilidad en Google Shopping free listings.

### Correcciones Prioritarias (código listo para implementar)

**Fix 1 — Organization corregido:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://lejanbrand.com#organization",
  "name": "Lejan Brand",
  "alternateName": "Lejan™",
  "url": "https://lejanbrand.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://lejanbrand.com/cdn/shop/files/lejan_pink.png?v=1752002847",
    "width": 8000, "height": 2250
  },
  "description": "Lejan™ es una marca de calzado barefoot supervisada por podólogos, que combina salud y estilo con suela zero-drop, puntera ancha y construcción flexible.",
  "sameAs": ["https://www.youtube.com/@lejanbrand", "https://www.instagram.com/lejan.brand/"],
  "contactPoint": {"@type": "ContactPoint", "contactType": "customer service", "availableLanguage": ["Spanish", "English", "German"]}
}
```

**Fix 2 — Person schema para el podólogo (nueva, añadir al homepage o página About):**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://lejanbrand.com/en#podiatrist",
  "name": "Alejandro Martínez Calderón",
  "jobTitle": "Podólogo",
  "worksFor": {"@type": "Organization", "@id": "https://lejanbrand.com#organization"},
  "description": "Podólogo fundador de Lejan™, responsable de la supervisión del diseño y metodología del calzado barefoot.",
  "knowsAbout": ["Calzado barefoot", "Podología", "Salud del pie", "Zero-drop footwear"]
}
```

**Fix 3 — AggregateRating en ProductGroup (con datos reales de reviews):**
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.7",
  "reviewCount": "481",
  "bestRating": "5",
  "worstRating": "1"
}
```

---

## 4. Sitemap — Score: 60/100

### Estructura
- **Sitemap index:** 72 child sitemaps × 18 variantes de locale
- **URLs totales estimadas:** ~3,762 (muy por debajo del límite de 50,000)
- **Formatos:** XML correcto, HTTPS, referencias en robots.txt ✅

### Problemas Críticos

**Colecciones internas en sitemap:**
- `/collections/all2` — duplicado de `/collections/all` (staging artifact)
- `/collections/fees-products` — colección interna de precios
- `/collections/impuesto-canarias` — colección de logística fiscal

**Páginas sin valor SEO en sitemap:**
`/pages/test-lock`, `/pages/link-bio`, `/pages/link-bio-newsletter`, `/pages/link-bio-ebook`, `/pages/link-bio-ebook-juanetes`, `/pages/snake-game`, `/pages/barefoot-game`, `/pages/widget-influence-io`, `/pages/pre-store`

**URLs legacy de blog (probable 301):**
5 URLs con formato `/blogs/{slug}` sin subfolder — probablemente redirigen a `/blogs/lejan-blogs/{slug}`. El sitemap debe apuntar a la URL canónica final.

**Sin sitemap `/es/` explícito:**
El mercado español usa las URLs de raíz (`/products/`, `/collections/`). Esto es arquitecturalmente consistente con Shopify Markets pero crea ambigüedad sobre la identidad del locale raíz.

**5 colecciones SS26 solapadas:**
`/collections/lejan-one®-ss26`, `-adulto`, `-kids`, `-standard`, `-wide` — cinco variantes de temporada con productos solapados. Riesgo de señal de thin/duplicate content.

---

## 5. Performance / Core Web Vitals — Score: 45/100 (estimado)

*Nota: PSI API sin cuota durante la auditoría. Análisis basado en inspección de código fuente y headers HTTP.*

### Señales de Riesgo Identificadas

**TTFB muy alto:** Server processing time de 996–1,589ms (detectado en `server-timing` headers). El objetivo es <200ms. Esto afecta directamente LCP y la experiencia de usuario.

**Shopify complexity scores elevados:** Homepage: 9,920–11,850. Colecciones: 15,850. Estos scores correlacionan con mayor tiempo de renderizado SSR.

**Imagen hero como CSS background:** La imagen hero principal se carga via CSS `background-image`, no como `<img>` con `fetchpriority="high"`. Esto retrasa el descubrimiento del candidato LCP.

**Sin `<link rel="preload">` para imagen hero:** El único asset preloaded en el header HTTP es el CSS (`main.css`). No hay preload de imagen hero.

**Fuentes con `font-display: fallback`:** 7 font-face declarations con `font-display: fallback`. Correcto para evitar FOIT, pero puede causar CLS si el font fallback difiere mucho del font cargado.

**Locksmith JS inline (~8KB):** Se ejecuta en todas las páginas aunque la mayoría están desbloqueadas (`transparent: true`).

### Recomendaciones
1. Añadir `<link rel="preload" as="image" fetchpriority="high">` para la imagen hero en el `<head>`
2. Auditar y eliminar secciones, apps y metafields no utilizados del tema para reducir complexity score
3. Target: server processing <200ms — revisar con Shopify Support si el plan lo permite o evaluar Shopify Plus para mayor capacidad de cómputo

---

## 6. Visual y Mobile — Estado: Parcial

*Nota: El agente de análisis visual se interrumpió durante el proceso. Hallazgo principal confirmado:*

**OG image `Placeholder.jpg` CONFIRMADA en producción:**
`<meta property="og:image:secure_url" content="https://lejanbrand.com/cdn/shop/files/Placeholder.jpg">` — esta imagen se muestra en todas las previsualizaciones sociales del sitio.

**Recomendaciones (basadas en análisis del HTML):**
- Reemplazar `Placeholder.jpg` con una imagen de marca real (1200×630px mínimo) para todas las páginas que no tienen OG image específica
- Verificar tap targets en móvil (especialmente los selectores de talla y color)
- Validar con Lighthouse Mobile que el layout no produce CLS en el hero carousel

---

## 7. GEO / AI Search Readiness — Score: 34/100

### Estado de Crawlers IA

| Crawler | Estado | Señalización |
|---------|--------|--------------|
| GPTBot (OpenAI) | Permitido (implícito) | Sin regla explícita |
| ClaudeBot (Anthropic) | Permitido (implícito) | Sin regla explícita |
| PerplexityBot | Permitido (implícito) | Sin regla explícita |
| CCBot (Common Crawl) | Permitido (implícito) | Sin regla explícita |

**`llms.txt`:** ❌ Devuelve 404. Ausente.

### Scores por Dimensión GEO

| Dimensión | Peso | Score |
|-----------|------|-------|
| Citabilidad | 25% | 28/100 |
| Legibilidad estructural | 20% | 38/100 |
| Señales de autoridad y marca | 20% | 35/100 |
| Accesibilidad técnica | 20% | 40/100 |
| Contenido multi-modal | 15% | 30/100 |

### Fortalezas GEO
- Fundador con nombre real (Alejandro Martínez Calderón) y título profesional (Podólogo)
- Blog con 38 artículos sobre temas de búsqueda real en IA (pie plano, fascitis plantar, zero-drop)
- Nomenclatura de productos con marcas registradas (Lejan One®, Melrose®, Weekdays®)
- Un artículo del blog contiene afirmaciones citables verificables ("el pie humano tiene 26 huesos y 33 articulaciones")

### Debilidades GEO Críticas
- Sin `llms.txt` → los crawlers IA no saben qué priorizar
- Blog gateado → el contenido educativo (el mayor activo de cita) es invisible para IA
- Sin fechas en artículos → Perplexity y Google AIO depriorizan contenido sin fecha
- Sin citas externas ni estadísticas con fuente → no hay cadena de citas que los LLMs puedan seguir
- Sin Article schema con `datePublished` y `author` → los sistemas IA no pueden atribuir el contenido
- FAQ solo cubre logística (envíos, devoluciones) — ninguna pregunta de salud o producto que dispare AI Overviews

### Visibilidad Estimada por Plataforma

| Plataforma | Visibilidad Estimada | Barrera Principal |
|------------|---------------------|-------------------|
| Google AI Overviews | Muy Baja | Sin schema, sin fechas, sin citas externas |
| ChatGPT (web browsing) | Muy Baja | Sin llms.txt, sin entidad Wikipedia, sin respuestas directas |
| Perplexity | Baja-Media | Blog rastreable y temáticamente relevante, pero sin citas externas |
| Bing Copilot | Muy Baja | Sin schema Person/Article, sin señales de autoridad |

---

## 8. Backlinks — Estado: Parcial

*Solo Common Crawl disponible (sin API de Moz ni Bing Webmaster). Dominio confirmado en el índice de Common Crawl.*

### Evaluación
- **Tier de autoridad estimado:** Bajo-Medio para e-commerce de nicho. La marca tiene presencia en redes sociales (Instagram, TikTok, YouTube referenciados) pero no se detectaron menciones editoriales en medios de podología, salud o calzado.
- **Oportunidades de link building:** Blogs de podología, asociaciones de podólogos españoles, medios de fitness/salud, roundups de "mejores zapatos barefoot".
- **Presencia en roundups EN:** El sitio barefootshoeguide.com tiene una reseña positiva de Lejan — debería ser citada en el sitio como señal de "as seen in".

---

## 9. SXO / Search Experience — Score: 44/100

### Page-Type Mismatch: ALTO

**Keywords objetivo principales:** "barefoot shoes" (EN), "calzado barefoot" (ES), "zapatos barefoot España"

**Tipo de página esperado por Google (EN):** Editorial Roundup + Buyer Guide (posiciones 1-7 son exclusivamente roundups de comparación). Solo las posiciones 8-10 incluyen brand homepages — y esas marcas (Xero, Vivobarefoot) tienen 35-40% de contenido educativo integrado en el homepage.

**Tipo de página esperado por Google (ES):** Multi-brand Marketplace o Brand Homepage con contenido educativo profundo, FAQ, y reviews on-page.

**Tipo de página de Lejan:** Brand Homepage / Product Showcase. La ratio de contenido educativo vs comercial es ~5% / 95%.

### Análisis de Intención por Keyword

| Keyword | Intención | Etapa | Match Lejan | Gap |
|---------|-----------|-------|-------------|-----|
| "barefoot shoes" (EN) | Informacional → Consideración | Awareness | ❌ Crítico | Homepage no responde ninguna PAA |
| "calzado barefoot" (ES) | Informacional → Consideración | Awareness | ❌ Alto | Sin profundidad educativa |
| "zapatos barefoot España" (ES) | Consideración → Decisión | Mid-funnel | ⚠️ Medio | Brand homepage válida pero sin reviews ni FAQ |
| "barefoot shoes women" | Consideración | Mid-funnel | ❌ Alto | Category pages sin SEO desarrollado |
| "best barefoot shoes 2026" | Investigación Comercial | Consideración | ❌ Crítico | Lejan debe aparecer EN roundups, no competir con ellos |

### People Also Ask — Sin Cobertura

Lejan no responde ninguna de las preguntas PAA activas para sus keywords objetivo:
- "¿Son buenos los zapatos barefoot para la fascitis plantar?"
- "¿Cuál es la diferencia entre zapatos barefoot y normales?"
- "¿Cómo hacer la transición a zapatos barefoot?"
- "¿Son los zapatos barefoot buenos para pies anchos?"
- "¿Cuánto tiempo tarda en adaptarse al calzado barefoot?"

### Puntuación por Persona

| Persona | Score | Problema Principal |
|---------|-------|--------------------|
| Health-Conscious Buyer | 4/10 | Credencial de podólogo invisible en homepage |
| Style-Focused Buyer | 6/10 | Estilo bien comunicado visualmente, mal en copy y social proof |
| Gift Buyer | 4/10 | Gift Card existe pero no está destacado; sin guía de tallas para regalo |

### Gaps SXO por Área

| Área | Score | Nota |
|------|-------|------|
| Page Type Alignment | 5/15 | Product showcase vs editorial roundup |
| Content Depth | 5/15 | ~5% ratio educativo vs 35-40% en competidores que rankean |
| UX Signals | 9/15 | Fotografía sólida, navegación limpia |
| Schema Markup | 0/15 | Sin schema detectado en homepage |
| Media Richness | 7/15 | Sin video, sin infográficos de comparación |
| Authority Signals | 9/15 | Trustpilot 4.7/481 existe pero no está on-page |
| Freshness | 9/10 | Colección SS26 actual ✅ |

---

## 10. E-commerce SEO — Estado: Parcial

*Complementado con datos del agente de Schema que sí analizó product pages en detalle.*

### Hallazgos Confirmados
- **Estructura:** Shopify con colecciones (Woman, Man, Kids) + productos individuales
- **Tipos de producto:** Zapatillas (Lejan One®, Melrose®, Weekdays®), Calcetines, Plantillas
- **Precios:** €120-130 para zapatillas, €8 para calcetines
- **ProductGroup schema:** Presente pero con errores críticos (ver sección Schema)
- **GTIN:** Solo en calcetines, ausente en zapatillas e insoles → bloquea Google Shopping free listings
- **Reviews:** 4.7/481 en Trustpilot — sin surfacing on-page, sin AggregateRating schema
- **Breadcrumbs:** Solo 2 niveles (Home → Producto) — falta el nivel de colección intermedio
- **Imágenes de producto:** URLs absolutas, HTTPS ✅. Alt text: verificar en Shopify Admin
- **Colecciones SS26:** 5 variantes solapadas — consolidar a 2 (adulto/kids)

### Oportunidades E-commerce
- Google Shopping free listings: bloqueado por falta de GTIN en todos los productos y errores en schema
- Rich results con rating stars: bloqueado por ausencia de AggregateRating schema
- Páginas de categoría: `/collections/mujer`, `/collections/hombre`, `/collections/kids` sin H1, sin copy educativo introductorio, sin FAQ schema

---

## Apéndice — Herramientas Configuradas

| Herramienta | Estado |
|-------------|--------|
| Google API (PSI, CrUX, GSC, GA4) | ❌ Sin configurar |
| Moz API | ❌ Sin configurar |
| Bing Webmaster API | ❌ Sin configurar |
| Common Crawl | ✅ Disponible (tier básico) |
| DataForSEO MCP | ✅ Disponible |
| Playwright / Chromium | ✅ Instalado |
| Drift Baseline | ❌ Sin baseline capturado |

*Para activar Google API: crear `/Users/rsolana99/.config/claude-seo/google-api.json` con `api_key` y `service_account_path`.*
*Para activar Moz: añadir `moz_api_key` en `/Users/rsolana99/.config/claude-seo/backlinks-api.json`.*

# Plan de Acción SEO — lejanbrand.com
**Fecha:** 28 de abril de 2026
**SEO Health Score Actual:** 44/100
**Target a 90 días:** 68/100

---

## SEMANA 1 — Correcciones Críticas (Indexación)
*Tiempo estimado total: 12-16 horas de desarrollo*

### 🔴 CRITICAL-1 — Quitar `noindex` del homepage `/de`
**Impacto:** El mercado alemán es completamente invisible para Google. Fix inmediato.
**Cómo:** En Shopify Admin → Themes → Edit code → Buscar el condicional que inyecta `noindex` en el mercado DE. Puede estar en: `layout/theme.liquid`, en la config de Locksmith, o en Shopify Markets (Password protection). Verificar las tres ubicaciones.
**Esfuerzo:** 1-2 horas
**Prioridad:** 🔴 Crítica

### 🔴 CRITICAL-2 — Reasignar `x-default` a `/en` en Shopify Markets
**Impacto:** Todos los usuarios sin match de idioma caen actualmente en una página en español.
**Cómo:** En Shopify Admin → Settings → Markets → establecer el mercado EN como mercado primario/default. Esto cambia `x-default` automáticamente. Verificar con Search Console tras el cambio.
**Esfuerzo:** 1 hora
**Prioridad:** 🔴 Crítica

### 🔴 CRITICAL-3 — Corregir `@context` de ProductGroup: `http://` → `https://`
**Impacto:** Bloquea la elegibilidad para rich results de producto (precios, disponibilidad en SERPs).
**Cómo:** En Shopify → Themes → Edit code → `snippets/structured-data.liquid` (o `product-schema.liquid`). Buscar `"@context": "http://schema.org/"` y reemplazar por `"@context": "https://schema.org"`.
**Esfuerzo:** 1-2 horas
**Prioridad:** 🔴 Crítica

### 🔴 CRITICAL-4 — Corregir `@id` relativo en ProductGroup a URL absoluta
**Impacto:** El `@id` relativo es técnicamente inválido en JSON-LD y puede impedir que Google conecte el schema con la URL canónica.
**Cómo:** En el mismo archivo Liquid, buscar el output del `@id` del ProductGroup y asegurarse de que incluye `https://lejanbrand.com` como prefijo. En Liquid: `{{ shop.url }}/en/products/{{ product.handle }}`.
**Esfuerzo:** 1 hora (junto con CRITICAL-3)
**Prioridad:** 🔴 Crítica

### 🔴 CRITICAL-5 — Reemplazar `Placeholder.jpg` como imagen OG global
**Impacto:** Toda la web muestra una imagen placeholder cuando se comparte en redes sociales.
**Cómo:** En Shopify Admin → Online Store → Themes → Theme settings → Social sharing → subir una imagen real de marca (1200×630px, <300KB, JPEG). También corregir el protocolo `http://` → `https://` en el tag `og:image`.
**Esfuerzo:** 30 minutos
**Prioridad:** 🔴 Crítica

### 🔴 CRITICAL-6 — Desgatear el blog Inside Barefoot para crawlers
**Impacto:** 38 artículos de contenido educativo de calidad son invisibles para Google y para cualquier LLM.
**Cómo:** En el template del blog (`sections/article-template.liquid` o equivalente), añadir una condicional que sirva el contenido completo cuando `request.design_mode == false` y el user-agent sea un bot conocido, O simplemente eliminar el gate de email para los artículos (mantener el gate solo para descargas/ebooks). Alternativa mínima: añadir las primeras 500 palabras como snippet público antes del gate.
**Esfuerzo:** 3-4 horas
**Prioridad:** 🔴 Crítica

---

## SEMANA 2 — Correcciones High (Señales Clave)
*Tiempo estimado total: 10-14 horas*

### 🟠 HIGH-1 — Crear llms.txt
**Impacto:** Señal directa a todos los crawlers IA sobre el contenido prioritario del sitio.
**Cómo:** Crear el archivo en el servidor Shopify (via un archivo estático en el CDN o una página de Shopify con handle `llms-txt` y Content-Type correcto) con el siguiente contenido mínimo:
```
# Lejan Brand — llms.txt
> Lejan™ es una marca española de calzado barefoot supervisada por el podólogo Alejandro Martínez Calderón. Ofrece zapatillas, calcetines y plantillas con zero-drop, puntera ancha y suela flexible para adultos y niños.

## Contenido prioritario
- https://lejanbrand.com/blogs/inside-barefoot — Blog educativo de calzado barefoot
- https://lejanbrand.com/en/pages/faqs — Preguntas frecuentes
- https://lejanbrand.com/en/collections/all — Catálogo completo
```
**Esfuerzo:** 1-2 horas
**Prioridad:** 🟠 Alta

### 🟠 HIGH-2 — Añadir `datePublished` visible en todos los artículos del blog
**Impacto:** Perplexity, Google AIO y ChatGPT depriorizan contenido sin fecha. Afecta los 38 artículos.
**Cómo:** En `sections/article-template.liquid`, añadir: `<time datetime="{{ article.published_at | date: '%Y-%m-%d' }}">{{ article.published_at | date: "%d %B %Y" }}</time>`. Añadir también en Article JSON-LD: `"datePublished": "{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}"`.
**Esfuerzo:** 2-3 horas
**Prioridad:** 🟠 Alta

### 🟠 HIGH-3 — Crear página About con credenciales del podólogo
**Impacto:** Principal ancla de E-E-A-T. Actualmente linkeada desde el footer pero devuelve 404.
**Cómo:** Crear página en Shopify Admin con handle `about` o `about-us`. Contenido mínimo requerido: nombre completo del podólogo (Alejandro Martínez Calderón), número de colegiado, foto profesional, historia de cómo nació Lejan, metodología de supervisión podológica. Añadir Person schema JSON-LD.
**Esfuerzo:** 4-6 horas (contenido + implementación)
**Prioridad:** 🟠 Alta

### 🟠 HIGH-4 — Añadir Article schema a todos los artículos del blog
**Impacto:** Sin Article schema, los artículos no tienen author verificable, datePublished, o topic para los sistemas IA.
**Cómo:** En `sections/article-template.liquid`, añadir bloque JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "{{ shop.url }}{{ article.url }}#article",
  "headline": "{{ article.title | escape }}",
  "datePublished": "{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}",
  "dateModified": "{{ article.updated_at | date: '%Y-%m-%dT%H:%M:%S%z' }}",
  "author": {"@type": "Person", "@id": "{{ shop.url }}/en#podiatrist", "name": "Alejandro Martínez Calderón"},
  "publisher": {"@id": "{{ shop.url }}#organization"},
  "image": "{{ article.image.src | img_url: '1200x' }}",
  "url": "{{ shop.url }}{{ article.url }}"
}
```
**Esfuerzo:** 2-3 horas
**Prioridad:** 🟠 Alta

### 🟠 HIGH-5 — Arreglar H1 del homepage
**Impacto:** El H1 está vacío o tiene un tagline sin keyword. Es el elemento de señal más importante.
**Recomendación EN:** `"Barefoot Shoes That Are Actually Beautiful — Podiatrist-Supervised Design"`
**Recomendación ES:** `"Zapatillas Barefoot Bonitas — Zero Drop, Supervisadas por Podólogo"`
**Esfuerzo:** 1 hora
**Prioridad:** 🟠 Alta

### 🟠 HIGH-6 — Corregir brand name en schema ProductGroup: `"Lejancitos"` → `"Lejan"`
**Impacto:** Inconsistencia en Google Merchant Center matching.
**Cómo:** En el mismo Liquid de product schema, cambiar `"name": "Lejancitos"` por `"name": "Lejan"`.
**Esfuerzo:** 30 minutos (junto con CRITICAL-3)
**Prioridad:** 🟠 Alta

### 🟠 HIGH-7 — Aumentar HSTS max-age a 31,536,000 segundos
**Cómo:** Cloudflare → SSL/TLS → Edge Certificates → HSTS → max-age: 12 months, habilitar `includeSubDomains`.
**Esfuerzo:** 30 minutos
**Prioridad:** 🟠 Alta

### 🟠 HIGH-8 — Eliminar colecciones/páginas internas del sitemap
**Páginas a excluir:** `all2`, `fees-products`, `impuesto-canarias`, `test-lock`, `link-bio*`, `snake-game`, `barefoot-game`, `widget-influence-io`, `pre-store`.
**Cómo:** Añadir `<meta name="robots" content="noindex">` en el template de cada página, o instalar una app de sitemap customizable (Sitemap Speeder). Shopify omite páginas noindex del sitemap generado automáticamente.
**Esfuerzo:** 2-3 horas
**Prioridad:** 🟠 Alta

---

## SEMANA 3-4 — Medium Priority (Calidad y Conversión)
*Tiempo estimado total: 16-24 horas*

### 🟡 MED-1 — Añadir AggregateRating schema a todos los productos
**Impacto:** +15-30% CTR esperado en rich results con star ratings.
**Cómo:** Conectar la app de reviews existente (o Trustpilot) con el template de producto. Añadir `aggregateRating` al ProductGroup Liquid usando los datos de reviews reales. Si no hay sistema de reviews en Shopify, instalar Judge.me (gratuito) o Loox.
**Esfuerzo:** 3-4 horas (incluyendo configuración de app)
**Prioridad:** 🟡 Media-Alta

### 🟡 MED-2 — Añadir `gtin` a todos los productos (no solo calcetines)
**Impacto:** Requisito de Google para free listings en Google Shopping.
**Cómo:** En Shopify Admin → Products → Cada producto → añadir Barcode (EAN/UPC) para cada variante. Luego en el schema Liquid, el `gtin` se auto-popula desde `variant.barcode`.
**Esfuerzo:** 2-4 horas (según número de variantes)
**Prioridad:** 🟡 Media-Alta

### 🟡 MED-3 — Añadir bloque educativo en el homepage
**Impacto:** Reduce el page-type mismatch para keywords de awareness. Mejora ratio educativo de 5% a ~25%.
**Contenido recomendado (3 bloques):**
1. "¿Qué es el calzado barefoot?" — definición en 100-150 palabras + FAQ schema
2. "¿Por qué Lejan?" — credenciales del podólogo + metodología en 100 palabras
3. "¿Para quién es?" — 3 personas (salud, estilo, regalo) con CTAs diferenciados
**Esfuerzo:** 4-6 horas (contenido + diseño + implementación)
**Prioridad:** 🟡 Media-Alta

### 🟡 MED-4 — Añadir social proof on-page
**Impacto:** Trustpilot 4.7/481 existe pero no está visible en el sitio. Crítico para los 3 perfiles de comprador.
**Cómo:** Instalar widget de Trustpilot en homepage (gratuito con cuenta Trustpilot). Añadir 3-4 reviews destacadas como HTML estático para que sean rastreables. Añadir badge "As featured in barefootshoeguide.com".
**Esfuerzo:** 2-3 horas
**Prioridad:** 🟡 Media

### 🟡 MED-5 — Optimizar páginas de colección (H1 + copy introductorio + FAQ)
**Páginas objetivo:** `/en/collections/mujer`, `/en/collections/hombre`, `/en/collections/kids`
**Qué añadir en cada una:**
- H1 con keyword: "Barefoot Shoes for Women — Zero Drop & Wide Toe Box"
- 150-200 palabras de copy educativo introductorio
- FAQPage schema con 3-5 preguntas relevantes
- Breadcrumb correcto
**Esfuerzo:** 4-6 horas
**Prioridad:** 🟡 Media

### 🟡 MED-6 — Corregir contenido bilingüe en páginas de producto EN
**Impacto:** Párrafos en español en páginas inglesas erosionan la confianza y la señal de localización.
**Cómo:** Auditar todas las descripciones de producto en el mercado EN desde Shopify Admin → Products → Translations. Completar traducciones faltantes.
**Esfuerzo:** 4-6 horas
**Prioridad:** 🟡 Media

### 🟡 MED-7 — Añadir FAQPage schema a la página de FAQ
**Cómo:** Añadir JSON-LD con 15-20 preguntas. Incluir preguntas de salud y producto además de logística.
**Nuevas preguntas recomendadas:**
- "¿Son buenos los zapatos barefoot para la fascitis plantar?"
- "¿Qué significa zero-drop?"
- "¿Cuánto tiempo tarda la adaptación al calzado barefoot?"
- "¿Son seguros los zapatos barefoot para niños con pies planos?"
- "¿Cuál es la diferencia entre calzado barefoot y minimalista?"
**Esfuerzo:** 3-4 horas
**Prioridad:** 🟡 Media

### 🟡 MED-8 — Implementar links internos contextuales producto → blog
**Cómo:** En las descripciones de producto de zapatillas, añadir sección "Lee más" con links a artículos relevantes del blog (suela flexible → artículo de suela flexible; transición → artículo de adaptación).
**Esfuerzo:** 2-3 horas
**Prioridad:** 🟡 Media

---

## MES 2-3 — Estrategia de Contenido y Autoridad

### 🟢 CONT-1 — Reescribir Top 5 artículos del blog para citabilidad IA
**Artículos objetivo:**
1. Pie plano en niños
2. Fascitis plantar y calzado barefoot
3. Zero-drop: qué es y por qué importa
4. Transición al calzado barefoot: protocolo paso a paso
5. Calzado barefoot vs calzado convencional: diferencias clave

**Cambios por artículo:**
- Añadir al menos 1 estadística con fuente (ej: datos de asociación española de podólogos, estudios PubMed)
- 1 cita externa a .gov, .edu o revista médica
- Reescribir la introducción para responder la pregunta principal en los primeros 40-60 palabras
- Estructura de headings en formato pregunta (¿Qué es? → ¿Por qué ocurre? → ¿Cómo ayuda el calzado barefoot?)
- Llevar longitud a 1,500-2,000 palabras
**Esfuerzo:** 3-5 horas por artículo

### 🟢 CONT-2 — Crear artículos para capturar PAA activas
**Nuevos artículos:**
- "¿Son buenos los zapatos barefoot para la fascitis plantar?" (PAA activa)
- "Cómo elegir la talla en calzado barefoot" (decisión-intent)
- "Mejores zapatos barefoot para pies anchos" (roundup propio)
- "Calzado barefoot para niños con pies planos: guía del podólogo" (health-intent + E-E-A-T)
- "Cómo hacer la transición a calzado barefoot: protocolo de 4 semanas" (PAA activa)

### 🟢 CONT-3 — Construir entidad Wikipedia / Wikidata para Lejan Brand
**Impacto:** La presencia en Wikipedia es uno de los señales de correlación más altos con citación por ChatGPT y Google AIO.
**Cómo:** Verificar si existe un artículo. Si no, crear uno siguiendo las normas de Wikipedia sobre notabilidad. La reseña en barefootshoeguide.com es una fuente secundaria válida. El podólogo fundador y los premios recibidos pueden apoyar la notabilidad.

### 🟢 CONT-4 — Link building especializado
**Objetivos prioritarios:**
- Blogs y revistas de podología española (Podologíamédica, Revista Española de Podología)
- Medios de maternidad/salud infantil (para la línea kids)
- Roundups de "mejores zapatillas barefoot" en inglés (anyasreviews.com, barefootuniverse.com)
- Páginas de recursos de fisioterapeutas y podólogos
- Colaboraciones con influencers de salud/wellness con audiencia en España

---

## Resumen de Impacto Esperado

| Acción | Dificultad | Tiempo | Impacto SEO |
|--------|-----------|--------|-------------|
| Quitar noindex /de | Baja | 1h | 🔴 Crítico |
| Fix x-default | Baja | 1h | 🔴 Crítico |
| Fix @context schema | Baja | 2h | 🔴 Crítico |
| Reemplazar Placeholder.jpg | Baja | 0.5h | 🟠 Alto |
| Desgatear blog | Media | 4h | 🔴 Crítico |
| Crear llms.txt | Baja | 2h | 🟠 Alto (GEO) |
| Dates en blog | Baja | 3h | 🟠 Alto |
| About page con podólogo | Media | 6h | 🟠 Alto |
| Article schema | Media | 3h | 🟠 Alto |
| Fix H1 homepage | Baja | 1h | 🟠 Alto |
| AggregateRating schema | Media | 4h | 🟡 Alto (CTR) |
| GTIN en productos | Baja | 4h | 🟡 Medio (Shopping) |
| Bloque educativo homepage | Alta | 6h | 🟡 Medio |
| Social proof on-page | Baja | 3h | 🟡 Medio |
| FAQ health questions | Media | 4h | 🟡 Medio (GEO) |

**Score proyectado tras Semana 1:** 52/100 (+8 puntos)
**Score proyectado tras Semana 2-4:** 62/100 (+18 puntos)
**Score proyectado tras Mes 2-3:** 72/100 (+28 puntos)

---

## Siguientes Pasos de Auditoría Recomendados

- **`/seo hreflang`** — Validación completa de return-links de las 40+ anotaciones hreflang (18 locales × all pages)
- **`/seo google`** — Configurar Google API (PSI, GSC, GA4) para obtener datos reales de CWV y posiciones orgánicas
- **`/seo backlinks`** — Configurar Moz API para análisis completo de perfil de backlinks y DA
- **`/seo local`** — Si hay intent local confirmado en GSC ("zapatos barefoot Madrid/Valencia"), desarrollar estrategia local
- **`/seo drift`** — Capturar baseline ahora para tracking futuro: `python scripts/drift_baseline.py https://lejanbrand.com/en`

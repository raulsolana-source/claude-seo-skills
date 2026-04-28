# claude-seo-skills

Skills para Claude Code especializadas en auditoría SEO técnica con IA.

---

## Skills disponibles

### `/audit-seo-tecnico`

Orquestador que lanza 10 agentes especializados en paralelo, consolida los resultados y genera un **PDF visual A4** listo para entregar al cliente y al equipo DEV.

**Categorías auditadas:**
1. Crawlability
2. Indexability
3. Security
4. URL Structure
5. Mobile Optimization
6. Core Web Vitals
7. Structured Data
8. JavaScript Rendering
9. IndexNow Protocol
10. AI Search Visibility (GEO)

**Output:** score 0-100 por categoría + roadmap por sprints + PDF con portada, executive summary, radar chart y detalle técnico por categoría.

---

## Instalación

### Opción A — Un comando

```bash
git clone --depth 1 https://github.com/raulsolana-source/claude-seo-skills /tmp/cg-skills \
  && cp -r /tmp/cg-skills/skills/audit-seo-tecnico ~/.claude/skills/ \
  && rm -rf /tmp/cg-skills
```

### Opción B — Pedírselo a Claude Code

```
Instala la skill audit-seo-tecnico desde
https://github.com/raulsolana-source/claude-seo-skills
```

### Verificar instalación

```
/skills
```

`audit-seo-tecnico` debe aparecer en la lista.

---

## Uso

```
/audit-seo-tecnico https://tudominio.com
```

El audit genera automáticamente:
- `technical-seo-[dominio]-[fecha].json` — datos estructurados
- `technical-seo-[dominio]-[fecha].pdf` — informe visual A4

### Requisitos para el PDF

Node.js 18+ y Puppeteer (se instala automáticamente en el primer uso):

```bash
cd ~/.claude/skills/audit-seo-tecnico/scripts && npm install
```

---

## Estructura del repo

```
skills/
└── audit-seo-tecnico/
    ├── SKILL.md              # Instrucciones del orquestador
    └── scripts/
        ├── package.json
        └── generate-pdf.js   # Generador de PDF con Puppeteer
```

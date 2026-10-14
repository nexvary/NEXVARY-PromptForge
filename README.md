# NEXVARY PromptForge

Arabic-first, responsive, open-source prompt-library and structured prompt composer.

## Stage 0.2: CC0 community catalog

The app ships 25 starter templates in 12 categories, including HIGH PERFORMANCE AI — EXECUTION PROTOCOL.

The automated build imports prompt content from https://github.com/f/prompts.chat/blob/main/prompts.csv. The upstream dataset is explicitly CC0 1.0. Each GitHub Actions build downloads the latest CSV, validates columns and fields, deduplicates prompt texts, applies an auditable keyword categorizer, and generates a collection of JSON shards with contributor references, SHA-256 checksum, and a timestamp.

Counts are determined by the real build, not fabricated or hardcoded. Some community prompts are in English; the application labels remain in Arabic.

### Features
- Keyword search, category filters, 48-card pagination, favorites, editable placeholders, copy.
- Local offline-capable structured prompt composer; no AI API key required.
- Manual JSON import/export with known licenses.
- Personal prompts and favorites persist in localStorage; externally downloaded community prompts do not, to prevent quota exhaustion.

### GitHub Actions

The workflow in .github/workflows/ci.yml runs unit tests and syntax checks, builds the downloadable promptforge-web-catalog artifact, then attempts a GitHub Pages deployment from main. The dataset refreshes every Monday.

For hosting, visit repository Settings > Pages > Source > GitHub Actions. Enable GitHub Actions. If the source is inaccessible or fewer than 500 valid prompts are returned, the build fails visibly rather than inventing successful ingestion.

Node.js 22+ tests: node --test

Local build (internet required):
1. Create a dist folder and copy index.html, app.js, engine.mjs, styles.css, icon.svg, manifest.webmanifest and sw.js.
2. Run node scripts/build-catalog.mjs --out dist.
3. Serve dist through any ordinary static web server.

The site still works with 25 original prompts when an external catalog is unavailable.

### JSON import shape

Array elements must include: id, category, title, description, template, license, source.
Example: id=my-demo; category=marketing; title=إعلان; description=قالب; template=اكتب إعلانًا عن {{product}}; license=CC0-1.0; source=Author.

### Limitations
- Keyword categorization is approximate, not AI classification.
- No Android APK, Windows EXE, semantic/vector search, remote AI refinement or automatic translation yet.
- A configured CI workflow is NOT proof that it has passed; always inspect job results.
- Untrusted prompt data is rendered as text, not executed as instructions or HTML.

Code license MIT; original seed prompts CC0. Review licenses and attribution before importing other projects.

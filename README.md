# NEXVARY PromptForge

Arabic-first, offline-capable prompt library and structured prompt generator — foundation v0.1.0.

**Implemented:** responsive Arabic RTL browser UI; 25 starter templates, including the user-provided High Performance AI execution protocol in 12 categories; keyword search; favorites; variable substitution; offline structured prompt composition; JSON import/export with supported license checks and deduplication; local-only browser storage; Node tests and GitHub Actions CI.

**Not yet implemented:** automated collection of thousands of third-party prompts, semantic search, remote AI completion, Android/Windows packaged builds. We will only import third-party content after reviewing licensing and attribution.

## Run
Serve this repository as a static website over HTTP(S). No API keys or build dependencies are required. GitHub Pages can be enabled under Settings > Pages > GitHub Actions. The deployment workflow will attempt to publish on successful pushes to main.

## Test
Node.js 20+: run `node --test` in the repository (CI does this automatically).

## JSON import example
```json
[{"id":"my-demo","category":"marketing","title":"عنوان","description":"وصف","template":"أنشئ إعلانًا عن {{product}}","license":"CC0-1.0","source":"Original author"}]
```

Supported import licenses: CC0-1.0, CC-BY-4.0, MIT and Apache-2.0. Attribution obligations remain with the importer. Imported data stays in browser localStorage. Do not import files unless reuse rights are confirmed.

Source code MIT. Starter prompts written for this project are CC0-1.0.

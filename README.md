# NEXVARY PromptForge — Prompt Intelligence Studio

**v0.3.0 foundation:** Arabic-first, RTL, open-source prompt library, ranked multilingual search, native-packaged Android app and Windows portable desktop, offline structured prompt generator, and optional AI-powered prompt refinement through a user-hosted server.

## Verified source catalog

The build pipeline imports from the [prompts.chat CC0 library](https://github.com/f/prompts.chat/blob/main/prompts.csv), verifies input, records attribution, removes duplicates, and splits JSON files. A successful previous CI run imported 1,986 prompts, in addition to 25 native seed prompts; future import counts may change. Original prompts can be used offline after installing the web app. Android/Windows workflows copy source data inside their application packages for offline use.

## Features

- Arabic RTL responsive UI; 12 categories; favorites, variable editing, import and export of licensed JSON.
- Search ranks title, description and body matches, normalizes Arabic spelling, and tolerates minor English title typos.
- Local prompt composer supports task, audience, constraints, language, model and desired format, without an AI API key.
- Optional **AI Refine** sends the prompt only after user confirmation to an explicitly configured HTTPS server. The AI key remains server-side. See [AI-SERVER](docs/AI-SERVER.md).
- PWA caching, Android and Windows wrappers with native packaging workflows. Note: debug Android APK is not Play Store release-signed.

## Download and build verification

[GitHub Actions](https://github.com/nexvary/NEXVARY-PromptForge/actions) has three workflows:

- **Verify, Build Catalog and Deploy:** tests, builds the static web app, archives `promptforge-web-catalog`, and publishes GitHub Pages on main if repository settings allow.
- **Android Debug APK:** bundles the website and source catalog and builds `NEXVARY-PromptForge-Android-Debug-APK` on Ubuntu.
- **Windows Portable EXE:** packages `NEXVARY-PromptForge-Windows-Portable` on a Windows runner using Electron.

Do not claim a release is available until its workflow has completed successfully and the artifact is listed. Unpack GitHub Actions artifacts before installation. Windows binaries may show a reputation warning because they are unsigned; the Android debug APK is for testing, not Play Store distribution.

### Build prerequisites

- Node.js 22+ for server and tests; `node --test` for unit tests.
- Internet access for downloading the CC0 source CSV during build.
- GitHub Pages: Settings → Pages → Build and deployment → Source: **GitHub Actions**. The repository owner must enable it if deployment fails.
- Android CI config targets Android SDK 35 with AGP 8.7.3, Gradle 8.9, Java 17.
- Windows CI uses Node.js 22, Electron and electron-builder; does not require a CLI for end users.

## Security and limitations

- No bundled secrets; optional AI server takes API key from environment variables and should be deployed behind TLS. IP rate limits alone do not replace public authentication.
- External templates are **untrusted data**, displayed as plain text rather than executed instructions.
- Dataset categorization is heuristic, and some community text is English. AI translation and semantic embeddings are not yet implemented. Ranked lexical search is not the same as true semantic search.
- There is no cloud user account or multi-device sync; favorites are per-device.
- Android and Windows release-signing requires owners' private certificates. Keep signing material in private secrets.

MIT application code; project-written seed prompts are CC0. Do not import other copyrighted prompt catalogs without verifying permitted reuse.


## v0.4 Personal Studio
- Add an original private prompt from the Manage Library tab; the app will save it on the current device, searchable under the selected category.
- User-created prompts default to the `PRIVATE` license, and are **not** part of community exports.
- Delete personal prompts through the library preview. Shared source prompts cannot be deleted.
- Export/import a personal backup of custom prompts and favorite IDs.
- Lightweight Arabic↔English synonym matching is available offline; this is **not** an embedding model.
- A six-item structure checklist highlights missing elements in the locally composed prompt, and does not grade AI accuracy.

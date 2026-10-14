# Optional AI Refinement API

PromptForge runs without an AI key. If you operate your own server, you may enable optional AI refinement with a provider key kept server-side.

## Settings

Set these environment variables on the trusted host:

- AI_API_KEY: a private API key (never include in frontend code, GitHub, or browser localStorage).
- AI_MODEL: provider model supporting Chat Completions (defaults to gpt-4.1-mini; verify its availability).
- AI_API_URL: trusted HTTPS Chat Completions endpoint; defaults to https://api.openai.com/v1/chat/completions.
- ALLOWED_ORIGIN: the exact website origin allowed to call this API, for example https://nexvary.github.io.
- HOST: set 127.0.0.1 behind Nginx by default.
- PORT: default 8789.

The web UI accepts the URL of your own API endpoint and stores the **URL only**. Send the prompt only after the user actively clicks refine. Deploy behind HTTPS with authenticated or restricted access before exposing to the public: IP-only rate limiting is not strong enough for public paid usage. Consider authentication, billing quotas, abuse monitoring and CSRF safeguards if moving beyond a trusted private deployment.

Use an Nginx reverse proxy to route /api/refine and /health to 127.0.0.1:8789. Do not copy secrets into README, Actions, or browser settings. Node.js 22+, no runtime npm dependencies for this server. Health: GET /health; refine: POST /api/refine with JSON {"prompt":"..."}.

The API rewrites prompts, not answers them. Model calls have costs and provider latency. No AI usage is claimed unless a provider is configured and a request succeeds.

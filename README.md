# PauseCheck

Understand a suspicious message before you act. PauseCheck is a browser-local prototype built for SafeSpace Hacks. It explains observable English-language warning patterns and suggests independent verification steps. It does not label messages safe or authenticate senders.

## Run locally

Requires Node.js 24 or later and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. No API keys, accounts, database, environment variables, or paid services are needed.

## Judging links

- Working demo: https://pausecheck.alexdaon243.chatgpt.site
- Project source: https://github.com/adii-madhavi/pausecheck
- Project story: https://pausecheck.alexdaon243.chatgpt.site/project-story.md

The source archive includes the application, tests, dependency lockfile, and setup and submission documents. It excludes credentials, Git metadata, installed dependencies, and submitted messages. The app links to this GitHub repository for source and serves the project story from its own host.

```sh
npm test
npm run build
npm run preview
```

The production output is `dist/`. It can be served by a static web host. Serve the built files over HTTP rather than opening `index.html` directly from disk.

## Deploy on Vercel

Import `adii-madhavi/pausecheck` into Vercel. The included `vercel.json` selects Vite, runs `npm ci` and `npm run build`, and publishes `dist/`. Node.js 24 is declared in `package.json`. No environment variables or secrets are required.

## Working features

- Paste a text, email, or chat message; analyze only when requested.
- Load three fictional examples: delivery fee, impersonated friend, appointment reminder.
- Explain pressure, requests for secrets, unusual payments, secrecy, and unexpected delivery fees.
- Highlight exact excerpts in the submitted message, with explanations and verification actions.
- Parse links locally and show the actual hostname as non-clickable text. Explain known shorteners, numeric IPs, URL user information, and encoded international domain names.
- Show cautious no-findings results, never a safe verdict or confidence score.
- Clear message and results; editing invalidates previous results.
- Support 10,000-character messages with explicit boundary validation.
- Provide keyboard focus, polite result announcements, dialogs, responsive layouts, and reduced-motion support.
- Switch between four complete visual themes: Calm Civic (the default), Field Notebook, Harbor Night, and Market Stall. Theme choice stays in memory and resets on reload.

## Privacy

Analysis is deterministic TypeScript running on the user's device. The application does not upload or log messages, call an AI service, use analytics, or save messages to browser storage. Assets and system fonts do not require third-party runtime requests. Links from messages are never opened, fetched, or used in HTML attributes.

Message state lives in React memory until cleared or the page reloads. Clearing does not erase the system clipboard, browser-managed history or memory, extensions, OS features, or hosting access logs. Remove personal details before pasting.

The development server uses a same-origin WebSocket for hot reload. The built app needs no analysis-related network access. Hosting the app still involves ordinary page and asset requests.

## Limitations

- This is a pattern-based prototype, not a fraud detector or security verdict.
- Rules mainly cover common English wording. Other languages, images, attachments, misspellings, obfuscation, and novel scams may evade them.
- Legitimate messages may trigger findings. Simple local negation is handled for secret-sharing reminders; broader context, quotations, and sarcasm are not reliably understood.
- Link recognition is heuristic. Bare-domain support covers selected suffixes; the app does not extract every possible address, follow redirects, check reputation, or compare a domain to an organization's official domain.
- An encoded international domain, numeric address, shortened link, or unparseable URL is an observation, not proof of fraud.
- The app cannot confirm identity, establish a legitimate transaction, recover funds, or provide emergency response.

## Project layout

```text
src/analysis.ts        Local rules, URL inspection, evidence highlighting
src/examples.ts        Synthetic demonstration messages
src/App.tsx            Accessible application and explanations
src/styles.css        Responsive reference-inspired theme
tests/analysis.test.ts Focused behavior checks
PHASES.md             Two-phase delivery scope
```

## Work period and attribution

The application source, examples, tests, and project documents in this folder were created in this conversation on October 18, 2026, during the October 17–November 22, 2026 event window. No pre-existing application source was imported. These dates describe this generated prototype; team members should separately disclose any work they add outside the window.

The interface layout was revised on October 19, 2026, within the same event window.

Phase 2 release checks, URL-parsing fixes, and public judging resources were prepared on October 20, 2026, within the same build window.

Pre-existing dependencies: React and React DOM (MIT), TypeScript (Apache-2.0), Vite and its React plugin (MIT), Tailwind CSS and its Vite plugin (MIT), and Phosphor Icons (MIT). See their distributed licenses in `node_modules` and the lockfile for exact installed versions. System fonts belong to their respective vendors. The favicon is a simple geometric pause mark created for this project. Demo messages are synthetic; `.example` domains and documentation IPs are used where applicable.

OpenAI Codex assisted with concept development, interface design, implementation, tests, and documentation. No LLM is called by the running application. Contributor names, eligibility, final submission details, and independent user research have not been supplied or verified.

Visual direction: the initial security-theme reference was replaced at the owner’s request on October 20, 2026 with four selectable themes. Calm Civic uses warm paper neutrals, deep teal and a system serif display face; Field Notebook uses a subtle grid, ink blue and ruled panels; Harbor Night uses deep navy, sand text and coral; Market Stall uses tangerine, green and plum example tiles. The Appearance selector applies to the entire workspace and dialogs without storing a preference. A split workspace places the message input and fictional examples on the left, with the explanation and suggested next step on the right. Phones use a stacked layout. Rounded elevated panels and subtle hover lifts respect reduced-motion preferences.

The installed build configuration follows the [Vite guide](https://vite.dev/guide/) and [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite).

## Demo walkthrough

1. Start with an empty input. Explain that the message stays in the browser.
2. Select **Delivery fee** and click **Explain this message**. Show the highlighted deadline, request for card details, delivery fee, and advice to check the official app.
3. Select **A friend needs help** and analyze. Show the gift-card request and pressure not to call.
4. Select **Appointment reminder** and analyze. Read the no-findings caveat: absence of detected clues is not proof of trustworthiness.
5. Open **Your privacy**, then clear the input. Mention that this prototype cannot authenticate senders or detect every scam.

Keep the judging demo and project files accessible through November 24, 2026. The release is intended for public access as authorized by the owner; the final handoff reports verified access status.

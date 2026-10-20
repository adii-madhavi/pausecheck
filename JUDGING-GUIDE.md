# PauseCheck: judging guide

## What to open

- Demo: https://pausecheck.alexdaon243.chatgpt.site
- Source files: https://github.com/adii-madhavi/pausecheck
- Project story: https://pausecheck.alexdaon243.chatgpt.site/project-story.md

The demo is browser-local and needs no API key, paid service, or separate account. Public access was authorized by the owner for judging.

## One-minute functional review

1. Choose **Delivery fee**, then **Explain this message**. Look for the highlighted deadline, request for card details, delivery fee, and advice to check the official app independently.
2. Choose **A friend needs help** and analyze it. Look for the gift-card request, urgency, and discouragement of a call.
3. Choose **Appointment reminder** and analyze it. The no-findings result must still explain that this does not establish trustworthiness.
4. Open **Your privacy**. The app explains its local processing and lack of message uploads or stored history.
5. Close the dialog and select **Clear**. The message and explanation are removed from the app.

All built-in examples are fictional. Do not use private data, real credentials, or systems without permission.

## Appearance

Use **Appearance** above the checker to select Calm Civic, Field Notebook, Harbor Night or Market Stall. Changing themes preserves the current message and results; reloading restores Calm Civic.

## Safer outcome

In the delivery example, the practical improvement is a verification step before payment: open the retailer or courier app independently rather than enter card details through the message link. This is a demonstrated prototype flow, not a measured real-world prevention rate.

## Main limitation

The app checks a limited set of English-language patterns. It cannot authenticate a sender, verify a website, detect every scam, or declare a message safe. Both false positives and missed concerns are possible.

## Verify the source

Install Node.js 24 or later, extract the source archive, and run:

```sh
npm ci
npm test
npm run build
npm run dev
```

See README.md for privacy details, limitations, technology and asset credits, AI assistance, and work dates. The source archive contains no installed dependencies or submitted messages.

## Team submission steps

Add the actual contributing team members, verify eligibility, upload the supplied screenshots, optionally record the supplied 2–3 minute script, and submit the final Devpost entry. Keep all judging links available through November 24, 2026. No Devpost submission or demo-video recording is performed by this release workflow.

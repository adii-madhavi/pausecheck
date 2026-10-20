# PauseCheck

## Elevator pitch

Understand suspicious messages before you act. PauseCheck explains warning signs in plain language and suggests practical ways to verify a request. Analysis stays in your browser.

## About the project

### Inspiration

A delivery fee, an urgent favor, a request for a verification code: everyday messages can ask us to make a trust decision before we have enough context.

PauseCheck focuses on that moment. The intended user is someone who receives an unexpected text, email, or chat message and wants help understanding what deserves a closer look.

### What it does

Paste a message or load one of three fictional examples. PauseCheck highlights wording associated with common pressure tactics, requests for sensitive information, unusual payments, secrecy, and unexpected delivery fees. Each finding explains what the app noticed and offers an independent verification step.

Links are displayed as non-clickable text with their parsed hostnames. The app can explain known shortening domains, numeric IP addresses, misleading URL user information, and encoded international domain names without visiting a website.

It never labels a message safe. When no supported patterns are found, it explicitly explains that this does not establish trustworthiness.

### How we built it

The prototype uses React, TypeScript, Tailwind CSS, Vite, and Phosphor Icons. A separate deterministic analysis module connects each finding to exact character ranges in the original message. Those ranges power the visible highlights.

Analysis runs in the browser. There is no backend, AI inference service, account system, or message history. The app does not upload submitted text or open its links. The interface includes keyboard support, result announcements, mobile layouts, and a clear action. Its floating workspace offers four selectable themes, with warm paper neutrals, deep teal and a serif heading in the default Calm Civic theme. Field Notebook, Harbor Night and Market Stall provide alternative palettes. Preferences stay in memory without adding browser storage.

### Challenges

The main design challenge was explaining uncertainty without creating a false sense of safety. The prototype uses the same cautious framing for messages with findings and messages without findings.

An implementation challenge was connecting overlapping or repeated pattern matches to readable evidence. The analysis groups repeated concerns and merges overlapping highlight ranges so the original text is preserved.

Another edge case was distinguishing a request for a secret from a simple instruction such as “Never share your password.” A narrow negation check handles this wording; broader context remains a limitation.

### What we learned

This build showed the value of separating observable details from claims about intent. A hostname can be parsed without knowing whether its owner is trustworthy. A pressured request can be explained without claiming to know that it is fraudulent.

Keeping analysis separate from the interface also made it possible to check evidence positions, boundary conditions, repeated matches, and cautious no-findings behavior directly.

### A safer outcome

In the synthetic delivery example, the prototype highlights a deadline, a request for card details, and a delivery fee. It then advises the user to open the retailer or courier app independently rather than enter payment details through the message link.

The practical improvement is a clear verification action before payment. This is a demonstrated prototype flow, not evidence of measured real-world scam prevention or a user-study result.

### Limitations

PauseCheck cannot prove that a message, sender, or website is legitimate. It uses a limited set of English-language rules and can miss scams or flag legitimate wording. It does not understand images or attachments, follow redirects, check reputation, or provide incident response. An absence of findings is not a safety guarantee.

### Work period and credits

The initial application source, demo examples, tests, and documents were created on October 18, 2026. The interface layout was revised on October 19, and Phase 2 release work continued on October 20. All work falls within the event build window. No prior application source was imported.

React, React DOM, TypeScript, Vite, Tailwind CSS, and Phosphor Icons are pre-existing dependencies, credited under their respective licenses. OpenAI Codex assisted with the concept, design, implementation, tests, and documentation. The running application does not call an AI model.

## Built with

React, TypeScript, Tailwind CSS, Vite, Phosphor Icons, HTML, CSS

## Before final submission

- Add all contributing team members and verify eligibility.
- Use the demo and downloadable source links below in the Devpost entry.
- Upload the supplied screenshots of the running application to the image gallery.
- Optionally record the walkthrough in `DEMO-SCRIPT.md`.
- Verify judging links remain accessible through November 24, 2026.
- Update this story if the implementation changes, and replace qualitative learning statements if they do not reflect your team's own experience.

No Devpost submission has been made by this build workflow.

## Try it out

- Working demo: https://pausecheck.alexdaon243.chatgpt.site
- Project source download: https://github.com/adii-madhavi/pausecheck
- Project story: https://pausecheck.alexdaon243.chatgpt.site/project-story.md

export const MAX_MESSAGE_LENGTH = 10_000;
export const NO_FINDINGS_SUMMARY = 'No common warning patterns were found by these checks. This does not establish that the message is trustworthy.';

export type Evidence = { text: string; start: number; end: number };
export type Finding = {
  id: string;
  title: string;
  explanation: string;
  nextStep: string;
  evidence: Evidence[];
};
export type MessageLink = { text: string; hostname: string | null; notes: string[] };
export type Analysis = {
  message: string;
  findings: Finding[];
  links: MessageLink[];
  summary: string;
  nextSteps: string[];
};

type Rule = Omit<Finding, 'evidence'> & { pattern: RegExp };

const rules: Rule[] = [
  {
    id: 'pressure',
    title: 'Pressure to act quickly',
    pattern: /\b(?:urgent(?:ly)?|immediately|act now|right now|final (?:notice|warning)|within\s+\d+\s*(?:minutes?|hours?)|(?:account|access)\s+(?:will be|has been|is)\s+(?:suspended|locked|closed)|(?:suspend|lock|close)\s+your\s+account)\b/gi,
    explanation: 'A tight deadline or threat can make it harder to stop and check. Legitimate messages can use this wording too; urgency alone does not prove a scam.',
    nextStep: 'Pause before responding. Check the request through the official app or a contact method you already know.',
  },
  {
    id: 'sensitive',
    title: 'A request for sensitive information',
    pattern: /\b(?:send|share|enter|provide|confirm|verify|tell me|reply with)\b[^.!?\n]{0,65}\b(?:password|passcode|pin|otp|one[- ]time (?:password|code)|verification code|security code|card (?:details|number)|bank (?:details|account)|social security (?:number|details))\b/gi,
    explanation: 'This wording asks for information that could give someone access to an account or payment method. The message itself cannot establish who is asking.',
    nextStep: 'Do not share passwords or one-time codes with a sender. Open the service independently and check whether action is needed.',
  },
  {
    id: 'unusual-payment',
    title: 'A payment method worth questioning',
    pattern: /\b(?:gift\s*cards?|bitcoin|cryptocurrency|crypto(?:currency)?\s+(?:payment|transfer|wallet)|wire\s+(?:transfer|money)|transfer\s+(?:me\s+)?(?:money|funds)|send\s+(?:me\s+)?(?:money|funds)|(?:buy|purchase)\s+(?:\w+\s+){0,2}gift\s*cards?)\b/gi,
    explanation: 'Requests involving gift cards, cryptocurrency, or money transfers deserve an independent check. Some payments can be difficult to reverse.',
    nextStep: 'Verify the request with the person or organization using a known number before making any payment.',
  },
  {
    id: 'secrecy',
    title: 'Pressure to keep it secret',
    pattern: /\b(?:don['’]t\s+(?:tell|call|contact)|do not\s+(?:tell|call|contact)|keep\s+(?:this|it)\s+(?:a secret|between us|confidential|to yourself)|(?:bypass|ignore)\s+(?:the\s+)?(?:normal|usual|security)\s+(?:process|procedure|checks?))\b/gi,
    explanation: 'Discouraging a conversation or bypassing normal checks can isolate you from someone who could help verify the request.',
    nextStep: 'Check with a trusted person or contact the supposed sender through another channel before acting.',
  },
  {
    id: 'delivery-fee',
    title: 'An unexpected delivery payment',
    pattern: /\b(?:delivery|redelivery|shipping|customs|parcel)\s+(?:\w+\s+){0,2}(?:fee|payment|charge)|\b(?:pay|payment)\b[^.!?\n]{0,45}\b(?:release|redeliver)\s+(?:your\s+|the\s+)?(?:parcel|package|delivery)\b/gi,
    explanation: 'An unexpected fee connected to a delivery is a reason to check your actual order. This tool cannot confirm whether a parcel or charge exists.',
    nextStep: 'Open your retailer or courier app yourself and check the order there. Do not use the message link to enter payment details.',
  },
];

const shorteners = new Set(['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'ow.ly', 'buff.ly', 'rb.gy', 'cutt.ly', 'shorturl.at']);

function evidenceFor(message: string, pattern: RegExp): Evidence[] {
  return Array.from(message.matchAll(new RegExp(pattern.source, pattern.flags)), (match) => ({
    text: match[0], start: match.index!, end: match.index! + match[0].length,
  }));
}

function trimLinkPunctuation(raw: string): string {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const counts = new Map<string, number>();
  for (const character of raw) {
    if ('()[]{}'.includes(character)) counts.set(character, (counts.get(character) ?? 0) + 1);
  }
  let end = raw.length;
  while (end) {
    const character = raw[end - 1];
    const opening = pairs[character];
    if (/[.,!?;:]/.test(character)) end--;
    else if (opening && (counts.get(character) ?? 0) > (counts.get(opening) ?? 0)) {
      counts.set(character, counts.get(character)! - 1);
      end--;
    } else break;
  }
  return raw.slice(0, end);
}

function inspectLinks(message: string): { links: MessageLink[]; evidence: Evidence[] } {
  // Parse text only. No destination is opened, resolved, or fetched.
  const pattern = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+|\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|org|net|io|co|ly|gd|gl|at|uk|in|dev|app|example|test|invalid)(?![a-z0-9-]|\.[a-z0-9])(?:[/?#][^\s<>"'`]*)?/gi;
  const links: MessageLink[] = [];
  const evidence: Evidence[] = [];
  const seen = new Set<string>();

  for (const match of message.matchAll(pattern)) {
    if (match.index! > 0 && message[match.index! - 1] === '@') continue;
    const text = trimLinkPunctuation(match[0]);
    if (seen.has(text)) continue;
    seen.add(text);
    const notes: string[] = [];
    let hostname: string | null = null;
    try {
      const parsed = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
      hostname = parsed.hostname;
      if (shorteners.has(hostname.replace(/^www\./, ''))) notes.push('This is a known link-shortening domain. Its final destination is hidden here.');
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[')) notes.push('This address uses a numeric IP address instead of a recognizable domain name.');
      if (parsed.username || parsed.password) notes.push('Text before the @ sign is not the destination. The destination hostname is shown below.');
      if (hostname.split('.').some((part) => part.startsWith('xn--'))) notes.push('The hostname uses an encoded international domain name. Check its spelling independently; this alone does not imply fraud.');
    } catch {
      notes.push('This address could not be parsed. Do not assume it is valid or trustworthy.');
    }
    links.push({ text, hostname, notes });
    if (notes.length) evidence.push({ text, start: match.index!, end: match.index! + text.length });
  }
  return { links, evidence };
}

export function analyzeMessage(message: string): Analysis {
  if (typeof message !== 'string' || !message.trim()) throw new Error('Paste a message or choose an example to get started.');
  if (message.length > MAX_MESSAGE_LENGTH) throw new Error('This prototype checks up to 10,000 characters at a time. Shorten the message and try again.');

  const findings: Finding[] = [];
  for (const { pattern, ...rule } of rules) {
    const evidence = evidenceFor(message, pattern).filter(({ start }) => {
      // A reminder not to share a secret is different from a request to share it.
      return rule.id !== 'sensitive' || !/\b(?:never|don['’]t|do not)\s+(?:ever\s+)?$/i.test(message.slice(Math.max(0, start - 24), start));
    });
    if (evidence.length) findings.push({ ...rule, evidence });
  }
  const { links, evidence } = inspectLinks(message);
  if (evidence.length) findings.push({
    id: 'link-details',
    title: 'Link details to look at closely',
    explanation: 'An address has details that may make its destination harder to recognize. These observations do not establish whether the website is harmful.',
    nextStep: 'Open the official app or use a web address you already know instead of following the message link.',
    evidence,
  });
  const nextSteps = [...new Set(findings.map((finding) => finding.nextStep))];
  if (!nextSteps.length) nextSteps.push('If the request is unexpected, verify it through a contact method you already trust before sharing information or making a payment.');

  return {
    message, findings, links,
    summary: findings.length ? `We found ${findings.length} ${findings.length === 1 ? 'pattern' : 'patterns'} worth a closer look. These are clues to investigate, not proof of a scam.` : NO_FINDINGS_SUMMARY,
    nextSteps,
  };
}

export function highlightSegments(message: string, evidence: Evidence[]): { text: string; highlighted: boolean }[] {
  const ranges = evidence.map(({ start, end }) => ({ start, end })).sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
  }
  const segments: { text: string; highlighted: boolean }[] = [];
  let cursor = 0;
  for (const { start, end } of merged) {
    if (start > cursor) segments.push({ text: message.slice(cursor, start), highlighted: false });
    segments.push({ text: message.slice(start, end), highlighted: true });
    cursor = end;
  }
  if (cursor < message.length) segments.push({ text: message.slice(cursor), highlighted: false });
  return segments;
}

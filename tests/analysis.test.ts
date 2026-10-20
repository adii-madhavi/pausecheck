import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeMessage, highlightSegments, MAX_MESSAGE_LENGTH, NO_FINDINGS_SUMMARY } from '../src/analysis.ts';
import { examples } from '../src/examples.ts';

test('delivery example explains pressure, payment and sensitive information', () => {
  const analysis = analyzeMessage(examples[0].message);
  assert.deepEqual(analysis.findings.map(({ id }) => id), ['pressure', 'sensitive', 'delivery-fee']);
  assert.equal(analysis.links[0].hostname, 'parcel-help.example');
  assert.match(analysis.nextSteps.join(' '), /retailer or courier app/);
});

test('friend example explains unusual payment and secrecy', () => {
  const analysis = analyzeMessage(examples[1].message);
  assert.deepEqual(analysis.findings.map(({ id }) => id), ['pressure', 'unusual-payment', 'secrecy']);
});

test('ordinary reminder never gets a safe verdict', () => {
  const result = analyzeMessage(examples[2].message);
  assert.equal(result.findings.length, 0);
  assert.equal(result.summary, NO_FINDINGS_SUMMARY);
  assert.match(result.nextSteps[0], /verify/);
});

test('empty and whitespace-only input produces a useful error', () => {
  for (const value of ['', '  ', '\n\t']) assert.throws(() => analyzeMessage(value), /Paste a message/);
});

test('length boundary is enforced without silently truncating messages', () => {
  assert.equal(analyzeMessage('x'.repeat(MAX_MESSAGE_LENGTH)).message.length, MAX_MESSAGE_LENGTH);
  assert.throws(() => analyzeMessage('x'.repeat(MAX_MESSAGE_LENGTH + 1)), /10,000/);
});

test('every excerpt comes from the original message at the stated position', () => {
  const message = '  URGENT!\nPlease send your verification code immediately.\nhttps://bit.ly/example  ';
  const analysis = analyzeMessage(message);
  assert.equal(analysis.message, message);
  for (const finding of analysis.findings) {
    for (const evidence of finding.evidence) assert.equal(message.slice(evidence.start, evidence.end), evidence.text);
  }
});

test('repeated matches are grouped into one finding per concern', () => {
  const analysis = analyzeMessage('Urgent. URGENT! Act now, immediately, right now.');
  assert.equal(analysis.findings.length, 1);
  assert.equal(analysis.findings[0].evidence.length, 5);
});

test('deterministic rules do not carry state between checks', () => {
  const message = 'URGENT: share your OTP immediately.';
  assert.deepEqual(analyzeMessage(message), analyzeMessage(message));
});

test('known shortened links are explained but never resolved', () => {
  const result = analyzeMessage('Details: https://bit.ly/fictional-demo.');
  assert.equal(result.links[0].text, 'https://bit.ly/fictional-demo');
  assert.equal(result.findings[0].id, 'link-details');
  assert.match(result.links[0].notes[0], /destination is hidden/);
});

test('numeric addresses and misleading user information show actual hostnames', () => {
  const result = analyzeMessage('See https://192.0.2.24/check and https://trusted.example@other.example/check');
  assert.equal(result.links[0].hostname, '192.0.2.24');
  assert.match(result.links[0].notes[0], /numeric IP/);
  assert.equal(result.links[1].hostname, 'other.example');
  assert.match(result.links[1].notes[0], /before the @ sign/);
});

test('shortener detection uses exact hostnames, not brand-like substrings', () => {
  const result = analyzeMessage('https://bit.ly.attacker.example/path');
  assert.equal(result.links[0].notes.length, 0);
  assert.equal(result.findings.length, 0);
});

test('ordinary links are shown without a positive trust claim', () => {
  const result = analyzeMessage('Booking details: https://booking.example/confirmation');
  assert.equal(result.links.length, 1);
  assert.equal(result.findings.length, 0);
  assert.equal(result.summary, NO_FINDINGS_SUMMARY);
});

test('plain domains and www links are recognized and repeated URLs are grouped', () => {
  const result = analyzeMessage('www.example.com/info, booking.example/help and www.example.com/info');
  assert.equal(result.links.length, 2);
  assert.equal(result.links[0].hostname, 'www.example.com');
  assert.equal(result.links[1].hostname, 'booking.example');
});

test('invalid addresses remain visible and get a parsing limitation', () => {
  const result = analyzeMessage('Visit https://[not-a-valid-host]/now');
  assert.equal(result.links[0].hostname, null);
  assert.match(result.links[0].notes[0], /could not be parsed/);
});

test('international domain encoding is explained without a scam verdict', () => {
  const result = analyzeMessage('Visit https://xn--bcher-kva.example/');
  assert.match(result.links[0].notes[0], /alone does not imply fraud/);
});

test('overlapping highlights preserve text exactly without duplication', () => {
  const message = 'abc def ghi';
  const segments = highlightSegments(message, [{ text: 'abc def', start: 0, end: 7 }, { text: 'def ghi', start: 4, end: 11 }]);
  assert.deepEqual(segments, [{ text: message, highlighted: true }]);
  assert.equal(segments.map(({ text }) => text).join(''), message);
});

test('unmatched text including markup remains unchanged as data', () => {
  const message = '<img src=x onerror=alert(1)> Hello 🌿\nGood morning.';
  const result = analyzeMessage(message);
  assert.equal(result.message, message);
  assert.deepEqual(highlightSegments(message, []), [{ text: message, highlighted: false }]);
});

test('checks do not perform network requests', () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unexpected network request'); };
  try { assert.ok(analyzeMessage('Urgent: visit https://192.0.2.24/check').findings.length); }
  finally { globalThis.fetch = original; }
});

test('simple advice not to share secrets is not treated as a request for them', () => {
  for (const message of ['Never share your password.', "Don't share your OTP.", 'Do not ever provide your verification code.']) {
    assert.ok(!analyzeMessage(message).findings.some(({ id }) => id === 'sensitive'));
  }
  assert.ok(analyzeMessage('Please share your password.').findings.some(({ id }) => id === 'sensitive'));
});

test('an email address by itself is not presented as a website link', () => {
  assert.equal(analyzeMessage('Reply to hello@example.com for your booking.').links.length, 0);
});

test('unsupported bare domain suffixes are not shortened to a different hostname', () => {
  for (const message of ['Read booking.company', 'Visit example.com.attacker']) {
    assert.equal(analyzeMessage(message).links.length, 0);
  }
  assert.equal(analyzeMessage('Visit booking.example/help').links[0].hostname, 'booking.example');
});

test('IPv6 addresses keep their closing bracket and report the parsed address', () => {
  const result = analyzeMessage('Visit https://[2001:db8::1]');
  assert.equal(result.links[0].text, 'https://[2001:db8::1]');
  assert.equal(result.links[0].hostname, '[2001:db8::1]');
  assert.match(result.links[0].notes[0], /numeric IP/);
});

test('surrounding punctuation is excluded while balanced URL punctuation is retained', () => {
  const wrapped = analyzeMessage('Read (https://booking.example/help).');
  assert.equal(wrapped.links[0].text, 'https://booking.example/help');
  const balanced = analyzeMessage('Read https://booking.example/help(topic)');
  assert.equal(balanced.links[0].text, 'https://booking.example/help(topic)');
});

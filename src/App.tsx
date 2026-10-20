import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRightIcon, ArrowUpRightIcon, ArrowCounterClockwiseIcon, CaretDownIcon,
  ChatCircleTextIcon, CheckIcon, ClockIcon, EyeIcon,
  InfoIcon, LightbulbIcon, LinkSimpleIcon, LockSimpleIcon, MagnifyingGlassIcon,
  PackageIcon, PauseIcon, ShieldCheckIcon, SparkleIcon, UsersIcon,
} from '@phosphor-icons/react';
import { analyzeMessage, highlightSegments, MAX_MESSAGE_LENGTH } from './analysis';
import type { Analysis } from './analysis';
import { examples } from './examples';

type InfoPanel = 'how' | 'privacy' | null;
const themes = [
  { id: 'calm-civic', name: 'Calm Civic' },
  { id: 'field-notebook', name: 'Field Notebook' },
  { id: 'harbor-night', name: 'Harbor Night' },
  { id: 'market-stall', name: 'Market Stall' },
] as const;
type Theme = typeof themes[number]['id'];

function InfoDialog({ panel, onClose }: { panel: Exclude<InfoPanel, null>; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const attachDialog = (node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    if (node && !node.open) {
      triggerRef.current = document.activeElement as HTMLElement;
      node.showModal();
    }
  };
  function close() {
    const trigger = triggerRef.current;
    dialogRef.current?.close();
    onClose();
    requestAnimationFrame(() => trigger?.focus());
  }
  return <dialog ref={attachDialog} className="info-dialog" aria-labelledby="dialog-title"
    onCancel={(event) => { event.preventDefault(); close(); }}
    onKeyDown={(event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        dialogRef.current?.querySelector('button')?.focus();
      }
    }}
    onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="dialog-inner">
      <div className="dialog-symbol"><LockSimpleIcon size={25} /></div>
      <h2 id="dialog-title">{panel === 'privacy' ? 'Your message stays with you.' : 'A little context. A clearer next step.'}</h2>
      {panel === 'privacy' ? <>
        <p>PauseCheck analyzes the text in this browser. The app does not send your message to a server, save it, or add it to browser storage.</p>
        <p>The checker has no separate account system, analytics, external AI calls, or tracking scripts. Clear the message or reload this page to remove it from the app.</p>
        <p>Your browser, extensions, operating system, or hosting provider may have their own behavior. Remove personal details before pasting. Clear does not erase your system clipboard.</p>
      </> : <>
        <ol className="dialog-steps">
          <li><strong>Paste a message.</strong> Remove names, account details, or anything private first.</li>
          <li><strong>Look at the wording.</strong> Local rules flag common English-language patterns such as urgency, sensitive requests, and unusual payments.</li>
          <li><strong>Verify independently.</strong> Use the explanation to choose a next step through a channel you already trust.</li>
        </ol>
        <p>This prototype does not verify identities, open links, detect every scam, or determine whether a message is safe. Messages in other languages may produce no findings.</p>
      </>}
      <button type="button" className="primary-button dialog-close" onClick={close}>Got it <CheckIcon size={18} /></button>
    </div>
  </dialog>;
}

function Results({ result }: { result: Analysis }) {
  const findings = result.findings;
  return <section className="results-section" aria-labelledby="results-title">
    <div className="pane-heading"><span className="pane-icon"><MagnifyingGlassIcon size={21} /></span><div><h2 id="results-title">Your explanation</h2><p>A closer look at the wording.</p></div></div>
        <div className={`result-summary ${findings.length ? '' : 'no-findings'}`}>
          <div><h3>{findings.length ? `${findings.length} ${findings.length === 1 ? 'pattern' : 'patterns'} to think about` : 'Nothing familiar stood out'}</h3><p>{result.summary}</p></div>
        </div>
        <aside className="next-steps-panel"><LightbulbIcon size={22} /><div><h3>A useful next step</h3><p>{findings.find((finding) => finding.id === 'delivery-fee')?.nextStep ?? result.nextSteps[0]}</p></div></aside>
        <div className="findings-scroll" tabIndex={0} role="region" aria-label="Message details">
        <div className="message-evidence">
          <div className="small-heading"><ChatCircleTextIcon size={17} /> Your message <span>{findings.length ? 'Wording highlighted below' : 'Read with context'}</span></div>
          <p>{highlightSegments(result.message, findings.flatMap((finding) => finding.evidence)).map((segment, index) => segment.highlighted ? <mark key={index}>{segment.text}</mark> : <span key={index}>{segment.text}</span>)}</p>
        </div>
        {findings.map((finding, index) => <article key={finding.id} className="finding">
          <div className="finding-title"><span className="finding-number">{String(index + 1).padStart(2, '0')}</span><h3>{finding.title}</h3></div>
          <div className="finding-copy"><blockquote>{finding.evidence[0].text}</blockquote><p>{finding.explanation}</p><div className="finding-action"><ArrowRightIcon size={17} /><p>{finding.nextStep}</p></div></div>
        </article>)}
        {result.links.length > 0 && <div className="links-panel">
          <h3><LinkSimpleIcon size={19} /> Links in this message</h3>
          <p className="links-caption">Shown as text only. We haven't opened or verified these addresses.</p>
          {result.links.map((link, index) => <div className="link-entry" key={`${link.text}-${index}`}>
            <code>{link.text}</code>
            <p>Hostname: <strong>{link.hostname ?? 'Could not be parsed'}</strong></p>
            {link.notes.map((note) => <p className="link-note" key={note}><InfoIcon size={15} />{note}</p>)}
          </div>)}
        </div>}
        </div>
    <div className="result-footer"><ShieldCheckIcon size={16} /><p>Clues to consider. Always verify independently.</p></div>
  </section>;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('calm-civic');
  const [message, setMessage] = useState('');
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState<InfoPanel>(null);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function updateMessage(value: string) {
    setMessage(value); setSelectedExample(null); setResult(null); setError(''); setAnnouncement('');
  }
  function selectExample(id: string) {
    const example = examples.find((item) => item.id === id)!;
    setMessage(example.message); setSelectedExample(id); setResult(null); setError('');
    setAnnouncement(`${example.label} example loaded. Select Explain this message to review it.`);
    inputRef.current?.focus({ preventScroll: true });
  }
  function clearMessage() {
    updateMessage(''); setAnnouncement('Message and results cleared.'); inputRef.current?.focus({ preventScroll: true });
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const analysis = analyzeMessage(message);
      setError(''); setResult(analysis); setAnnouncement(analysis.summary);
      requestAnimationFrame(() => {
        resultsRef.current?.focus({ preventScroll: true });
        if (window.matchMedia('(max-width: 760px)').matches) resultsRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    } catch (caught) {
      setResult(null); setError(caught instanceof Error ? caught.message : 'We could not check this message. Please try again.');
      inputRef.current?.focus();
    }
  }

  return <div className="theme-root" data-theme={theme}>
    <a className="skip-link" href="#message">Skip to message checker</a>
    <div className="app-layout">
    <aside className="app-rail" aria-label="PauseCheck navigation">
      <a href="#" className="wordmark" aria-label="PauseCheck home"><span className="brand-mark"><PauseIcon size={22} weight="fill" /></span><span>pause<span className="wordmark-check">check</span><span className="wordmark-period">.</span></span></a>
      <p className="rail-caption">A moment before you click.</p>
      <nav aria-label="Main navigation"><a className="active" href="#message" aria-current="page"><ChatCircleTextIcon size={19} />Message checker</a><button type="button" onClick={() => setPanel('how')}><LightbulbIcon size={19} />How it works</button><button type="button" onClick={() => setPanel('privacy')}><LockSimpleIcon size={19} />Your privacy</button></nav>
      <div className="rail-note"><span className="rail-note-icon"><ShieldCheckIcon size={30} weight="duotone" /></span><h2>A little pause<br />can make a difference.</h2><p>You don't need to decide from one message alone.</p></div>
      <div className="rail-privacy"><LockSimpleIcon size={17} /><p>Checked on your device.<br />No message uploads.</p></div>
    </aside>
    <main className="workspace-shell">
      <header className="workspace-header"><div><span className="workspace-eyebrow">YOUR MESSAGE WORKSPACE</span><h1 id="main-heading">Check the message.<br /><span>Choose your next step.</span></h1><p>A clearer view of what deserves a second look.</p></div><div className="workspace-preferences"><label className="theme-picker" htmlFor="theme">Appearance<select id="theme" value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>{themes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span className="local-label"><LockSimpleIcon size={14} /> Private by design</span></div></header>

      <div className="workspace-columns">
      <div className="input-column">
        <section className="checker-panel" aria-labelledby="checker-title">
          <div className="pane-heading"><span className="pane-icon"><ChatCircleTextIcon size={21} /></span><div><h2 id="checker-title">Your message</h2><p>Text, email, or chat. Let's take a look.</p></div></div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="input-heading"><label htmlFor="message">Paste your message</label><span>Text, email, or chat</span></div>
            <textarea id="message" ref={inputRef} value={message} onChange={(event) => updateMessage(event.target.value)} spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" aria-describedby={`message-help character-count${error ? ' message-error' : ''}`} aria-invalid={Boolean(error)} placeholder={'Something feel a little off?\n\nPaste the message here. We’ll explain the wording and suggest a way to verify the request.'} />
            <div className="input-bottom"><span id="message-help"><EyeIcon size={15} /> Remove names, account details, and anything private first.</span><span id="character-count" className={message.length > MAX_MESSAGE_LENGTH ? 'over-limit' : ''}>{message.length.toLocaleString('en-US')} / 10,000<span className="sr-only"> characters</span></span></div>
            {error && <p className="form-error" id="message-error" role="alert"><InfoIcon size={17} />{error}</p>}
            <div className="form-actions"><button type="submit" className="primary-button">Explain this message <ArrowRightIcon size={19} /></button><button type="button" className="clear-button" onClick={clearMessage} disabled={!message && !result}><ArrowCounterClockwiseIcon size={16} />Clear</button></div>
          </form>
          <div className="privacy-inline"><LockSimpleIcon size={15} /><p>Your message stays in this browser. No uploads. No saved history.</p></div>
        </section>

        <aside className="examples-panel" aria-labelledby="examples-title">
          <div className="examples-heading"><SparkleIcon size={19} /><h2 id="examples-title">Try a fictional message</h2></div>
          <div className="example-list">{examples.map((example, index) => {
            const Icon = [PackageIcon, UsersIcon, ClockIcon][index];
            return <button type="button" key={example.id} onClick={() => selectExample(example.id)} className={`example-button ${selectedExample === example.id ? 'selected' : ''}`} aria-pressed={selectedExample === example.id}><span className="example-icon"><Icon size={21} /></span><span className="example-text"><strong>{example.label}</strong><span>{example.type}</span></span><ArrowUpRightIcon size={14} className="example-arrow" /></button>;
          })}</div>
          <div className="examples-note"><InfoIcon size={16} /><p>Examples are made up. No real people, accounts, or active links.</p></div>
        </aside>
      </div>

      <div ref={resultsRef} tabIndex={result ? -1 : undefined} className="analysis-column" aria-label="Message explanation">
        {result ? <Results result={result} /> : <section className="explanation-empty" aria-labelledby="empty-title"><div className="empty-topline"><MagnifyingGlassIcon size={20} /><span>Your explanation</span></div><div className="empty-content"><span className="empty-symbol"><ShieldCheckIcon size={48} weight="duotone" /></span><h2 id="empty-title">A second look starts here.</h2><p>Paste a message or try an example.<br />Your explanation will appear in this space.</p><ol className="empty-preview"><li><EyeIcon size={18} /><span>Wording worth noticing</span></li><li><LightbulbIcon size={18} /><span>Why it might matter</span></li><li><ArrowRightIcon size={18} /><span>A practical next step</span></li></ol></div><div className="empty-bottom"><InfoIcon size={16} /><p>Context to help you decide, never a safety guarantee.</p></div></section>}
      </div>
      </div>
      <div aria-live="polite" role="status" className="sr-only">{announcement}</div>

      <section className="limits-note"><InfoIcon size={18} /><p>PauseCheck looks for common English-language warning patterns. It can't verify senders or websites, and it can miss scams. Always check important requests independently.</p></section>
      <details className="already-acted"><summary>Already clicked or shared something? <CaretDownIcon size={16} /></summary><p>Stop interacting with the message. Open the relevant service independently or use a phone number from a trusted source. If you shared a password, change it through the official service; if you made a payment, contact your payment provider promptly. This prototype cannot investigate an incident or recover money.</p></details>
      <nav className="release-links" aria-label="Project resources"><a href="https://github.com/adii-madhavi/pausecheck"><LinkSimpleIcon size={16} />Source code</a><a href="/project-story.md" download="PauseCheck-project-story.md">Project story <ArrowUpRightIcon size={14} /></a><span>Built for SafeSpace Hacks</span></nav>
    </main>
    </div>
    {panel && <InfoDialog panel={panel} onClose={() => setPanel(null)} />}
  </div>;
}

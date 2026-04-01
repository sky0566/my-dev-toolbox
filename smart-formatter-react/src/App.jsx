import { Suspense, lazy, useDeferredValue, useRef, useState } from 'react';
import { detectFormat, formatJson, highlightJson } from './formatter';

const MarkdownPreview = lazy(() => import('./MarkdownPreview'));

function App() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);
  const deferredInput = useDeferredValue(input);
  const trimmedInput = deferredInput.trim();
  const format = detectFormat(deferredInput);

  let jsonOutput = null;
  let jsonError = null;

  if (format === 'json') {
    jsonOutput = formatJson(trimmedInput);
  } else if (format === 'json-error') {
    try {
      formatJson(trimmedInput);
    } catch (error) {
      jsonError = error instanceof Error ? error.message : 'Invalid JSON';
    }
  }

  async function handleCopy() {
    // Markdown mode: copy source text so LaTeX $...$ stays intact.
    // JSON mode: copy the formatted JSON.
    // Otherwise: copy rendered innerText.
    let text;
    if (format === 'markdown') {
      text = deferredInput.trim();
    } else if (format === 'json' && jsonOutput) {
      text = jsonOutput;
    } else {
      text = outputRef.current?.innerText?.trim();
    }
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      document.body.removeChild(fallback);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-mark__row brand-mark__row--wide" />
          <span className="brand-mark__row" />
          <span className="brand-mark__row brand-mark__row--accent" />
        </div>
        <div>
          <h1>Smart Formatter</h1>
          <p>React + Vite edition for JSON, Markdown, math, and plain text.</p>
        </div>
      </header>

      <main className="workspace">
        <section className="pane pane--input">
          <div className="pane__header">Input</div>
          <textarea
            className="editor"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste JSON or Markdown text here. LaTeX in $...$ and $$...$$ is supported."
          />
        </section>

        <section className={`pane pane--output ${format === 'markdown' ? 'pane--markdown' : ''}`}>
          <div className="pane__header pane__header--with-tools">
            <span>Output</span>
            <div className="pane__tools">
              <span className={`badge badge--${format}`}>{badgeLabel(format)}</span>
              <button className={`copy-button ${copied ? 'copy-button--copied' : ''}`} onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className={`output output--${format}`} ref={outputRef}>
            {!trimmedInput && <div className="empty-state">Formatted output appears here.</div>}

            {trimmedInput && format === 'json' && (
              <pre className="json-view">{highlightJson(jsonOutput)}</pre>
            )}

            {trimmedInput && format === 'json-error' && (
              <div className="error-card">
                <strong>JSON Parse Error</strong>
                <p>{jsonError}</p>
              </div>
            )}

            {trimmedInput && format === 'markdown' && (
              <Suspense fallback={<div className="empty-state">Loading Markdown renderer...</div>}>
                <MarkdownPreview content={deferredInput} />
              </Suspense>
            )}

            {trimmedInput && format === 'text' && <pre className="plain-view">{deferredInput}</pre>}
          </div>
        </section>
      </main>
    </div>
  );
}

function badgeLabel(format) {
  if (format === 'json-error') {
    return 'JSON Error';
  }

  if (format === 'unknown') {
    return 'Unknown';
  }

  return format === 'text' ? 'Plain Text' : format.toUpperCase();
}

export default App;

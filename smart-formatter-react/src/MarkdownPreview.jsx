import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeRaw];

/**
 * Robust LaTeX preprocessor — renders all $...$ and $$...$$ to HTML
 * BEFORE Markdown parsing, so underscores/braces inside math never
 * conflict with Markdown emphasis or other syntax.
 */
function preprocessLatex(text) {
  // 1. Protect fenced code blocks & inline code from being touched
  const codeSlots = [];
  let s = text.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m) => {
    codeSlots.push(m);
    return `\x00CSLOT${codeSlots.length - 1}\x00`;
  });

  // 2. Display math: $$...$$
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_m, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch { return _m; }
  });

  // 3. Inline math: $...$
  //    Rules (mirrors latexlive.com behaviour):
  //      - Opening $ must NOT be preceded by \ or $ or digit
  //      - Closing $ must NOT be followed by $ or digit
  //      - No space right after opening $ or right before closing $
  //      - Content can contain \anything, {…} groups, anything except bare $
  s = s.replace(
    /(?<![\\$\d])\$(?!\s)((?:[^$\\]|\\[\s\S]|\{(?:[^{}]|\{[^{}]*\})*\})+?)(?<!\s)\$(?![\d$])/g,
    (_m, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
      } catch { return _m; }
    }
  );

  // 4. Restore code slots
  s = s.replace(/\x00CSLOT(\d+)\x00/g, (_m, i) => codeSlots[parseInt(i)]);
  return s;
}

function MarkdownPreview({ content }) {
  const processed = preprocessLatex(content);
  return (
    <article className="markdown-view">
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
        {processed}
      </ReactMarkdown>
    </article>
  );
}

export default MarkdownPreview;
import React from 'react';

export function detectFormat(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return 'unknown';
  }

  try {
    JSON.parse(trimmed);
    return 'json';
  } catch (error) {
    if (/^[\[{]/.test(trimmed)) {
      return 'json-error';
    }
  }

  const markdownPatterns = [
    /^#{1,6}\s+/m,
    /\*\*[^*]+\*\*/,
    /\*[^*]+\*/,
    /^\s*[-*+]\s+/m,
    /^\s*\d+\.\s+/m,
    /\[.+\]\(.+\)/,
    /!\[.*\]\(.+\)/,
    /^```/m,
    /`[^`]+`/,
    /^>\s+/m,
    /^\|.+\|$/m,
    /^---+$/m,
    /~~[^~]+~~/,
    /\$\$[\s\S]+?\$\$/,
    /(?<![\\$\d])\$(?!\s)(?:[^$\\]|\\[\s\S]|\{[^}]*\})+?(?<!\s)\$(?![\d$])/,
  ];

  const markdownScore = markdownPatterns.reduce((score, pattern) => {
    return pattern.test(trimmed) ? score + 1 : score;
  }, 0);

  if (markdownScore > 0) {
    return 'markdown';
  }

  return 'text';
}

export function formatJson(text) {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed, null, 2);
}

export function highlightJson(json) {
  const tokens = [];
  const pattern = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(json)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(json.slice(lastIndex, match.index));
    }

    const value = match[0];
    let className = 'json-number';

    if (value.startsWith('"')) {
      className = value.endsWith(':') ? 'json-key' : 'json-string';
    } else if (value === 'true' || value === 'false') {
      className = 'json-boolean';
    } else if (value === 'null') {
      className = 'json-null';
    }

    tokens.push(
      React.createElement('span', { className, key: `${className}-${match.index}` }, value)
    );

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < json.length) {
    tokens.push(json.slice(lastIndex));
  }

  return tokens;
}

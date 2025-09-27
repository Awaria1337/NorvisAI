'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Download, Edit, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
// Not using prism themes due to package variant; using highlight.js for coloring
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import cssLang from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import jsonLang from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import python from 'highlight.js/lib/languages/python';
import plaintext from 'highlight.js/lib/languages/plaintext';

let HLJS_REGISTERED = false;
const ensureHLJSLanguages = () => {
  if (HLJS_REGISTERED) return;
  try {
    if (!hljs.getLanguage('plaintext')) hljs.registerLanguage('plaintext', plaintext);
    if (!hljs.getLanguage('typescript')) hljs.registerLanguage('typescript', typescript);
    if (!hljs.getLanguage('javascript')) hljs.registerLanguage('javascript', javascript);
    if (!hljs.getLanguage('xml')) hljs.registerLanguage('xml', xml);
    if (!hljs.getLanguage('html')) hljs.registerLanguage('html', xml);
    if (!hljs.getLanguage('css')) hljs.registerLanguage('css', cssLang);
    if (!hljs.getLanguage('bash')) hljs.registerLanguage('bash', bash);
    if (!hljs.getLanguage('shell')) hljs.registerLanguage('shell', bash);
    if (!hljs.getLanguage('json')) hljs.registerLanguage('json', jsonLang);
    if (!hljs.getLanguage('sql')) hljs.registerLanguage('sql', sql);
    if (!hljs.getLanguage('python')) hljs.registerLanguage('python', python);
    HLJS_REGISTERED = true;
  } catch {
    // ignore
  }
};

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

// Dil isimleri ve renk noktası için renkler (header'daki nokta)
const languageConfig: Record<string, { color: string; name: string }> = {
  javascript: { color: '#F7DF1E', name: 'JavaScript' },
  typescript: { color: '#3178C6', name: 'TypeScript' },
  jsx: { color: '#61DAFB', name: 'React JSX' },
  tsx: { color: '#61DAFB', name: 'React TSX' },
  html: { color: '#E34F26', name: 'HTML' },
  css: { color: '#1572B6', name: 'CSS' },
  scss: { color: '#CF649A', name: 'SCSS' },
  sass: { color: '#CF649A', name: 'Sass' },
  less: { color: '#1D365D', name: 'Less' },
  python: { color: '#3776AB', name: 'Python' },
  java: { color: '#ED8B00', name: 'Java' },
  cpp: { color: '#00599C', name: 'C++' },
  c: { color: '#A8B9CC', name: 'C' },
  csharp: { color: '#239120', name: 'C#' },
  php: { color: '#777BB4', name: 'PHP' },
  ruby: { color: '#CC342D', name: 'Ruby' },
  go: { color: '#00ADD8', name: 'Go' },
  rust: { color: '#DEA584', name: 'Rust' },
  swift: { color: '#FA7343', name: 'Swift' },
  kotlin: { color: '#7F52FF', name: 'Kotlin' },
  json: { color: '#FFA500', name: 'JSON' },
  xml: { color: '#0060AC', name: 'XML' },
  yaml: { color: '#CB171E', name: 'YAML' },
  yml: { color: '#CB171E', name: 'YAML' },
  sql: { color: '#336791', name: 'SQL' },
  bash: { color: '#4EAA25', name: 'Bash' },
  shell: { color: '#4EAA25', name: 'Shell' },
  sh: { color: '#4EAA25', name: 'Shell' },
  md: { color: '#083FA1', name: 'Markdown' },
  markdown: { color: '#083FA1', name: 'Markdown' },
  txt: { color: '#6B7280', name: 'Text' },
  csv: { color: '#217346', name: 'CSV' },
  default: { color: '#6B7280', name: 'Code' }
};

const normalizeLanguage = (raw?: string): { id: string; hl: string } => {
  const l = (raw || 'default').toLowerCase();
  const map: Record<string, string> = {
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    tsx: 'tsx',
    typescript: 'typescript',
    jsx: 'jsx',
    html: 'markup',
    markup: 'markup',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'markup',
    bash: 'bash',
    sh: 'bash',
    shell: 'bash',
    go: 'go',
    ruby: 'ruby',
    php: 'php',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    python: 'python',
    sql: 'sql',
    md: 'markdown',
    markdown: 'markdown',
    rust: 'rust',
    swift: 'swift',
    kotlin: 'kotlin',
    csv: 'csv',
    txt: 'text',
  } as Record<string, string>;

  const hl = map[l] || 'javascript';
  const id = l === 'markup' ? 'html' : l;
  return { id, hl };
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, language }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const detected = (language || className?.replace('language-', '') || 'default').toLowerCase();
  const { id: langId, hl } = normalizeLanguage(detected);
  const config = languageConfig[langId] || languageConfig.default;

  // Ensure languages registered before first render highlight
  ensureHLJSLanguages();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      toast.success('Kod kopyalandı! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Kopyalama başarısız! ❌');
    }
  };

  const handleDownload = () => {
    const extension = langId === 'default' ? 'txt' : langId;
    const filename = `code.${extension}`;
    const blob = new Blob([children], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Kod indirildi: ${filename} 📥`);
  };

  const handleEdit = () => toast.success('Düzenleme özelliği yakında! ✏️');
  const handleWatch = () => toast.success('İzleme özelliği yakında! 👁️');

  return (
    <div ref={codeRef} className="code-block-container">
      {/* Header - sticky within this container */}
      <div
        ref={headerRef}
        className="code-block-header"
      >
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
          <span className="text-sm font-medium" style={{ color: config.color }}>{config.name}</span>
          <span className="text-xs text-gray-400">{children.split('\n').length} satır</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={handleWatch} className="h-7 w-7 p-0 hover:bg-gray-800">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEdit} className="h-7 w-7 p-0 hover:bg-gray-800">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-7 w-7 p-0 hover:bg-gray-800">
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 w-7 p-0 hover:bg-gray-800">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Code content with highlight.js */}
      <div className="code-block-content">
        <pre className="code-block-pre">
          {(() => {
            const lang = hljs.getLanguage(hl) ? hl : 'plaintext';
            let html = '';
            try {
              html = hljs.highlight(children, { language: lang, ignoreIllegals: true }).value;
            } catch {
              html = hljs.highlightAuto(children).value;
            }
            return <code className={`hljs language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />;
          })()}
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;

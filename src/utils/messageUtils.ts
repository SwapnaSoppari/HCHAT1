import Prism from 'prismjs';

// Import common language definitions
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

// Language aliases for better detection
const languageAliases: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'cs': 'csharp',
  'c++': 'cpp',
  'sh': 'bash',
  'shell': 'bash',
  'yml': 'yaml',
  'md': 'markdown'
};

const detectLanguage = (code: string): string => {
  // Simple heuristics for language detection
  if (code.includes('function') && code.includes('=>')) return 'javascript';
  if (code.includes('interface') && code.includes(':')) return 'typescript';
  if (code.includes('def ') && code.includes(':')) return 'python';
  if (code.includes('public class') || code.includes('private ')) return 'java';
  if (code.includes('using namespace') || code.includes('#include')) return 'cpp';
  if (code.includes('<?php')) return 'php';
  if (code.includes('SELECT') || code.includes('INSERT')) return 'sql';
  if (code.includes('{') && code.includes('"')) return 'json';
  if (code.includes('.class') || code.includes('#id')) return 'css';
  
  return 'markup'; // Default fallback
};

const highlightCode = (code: string, language?: string): string => {
  try {
    // Normalize language
    const normalizedLang = language ? (languageAliases[language.toLowerCase()] || language.toLowerCase()) : detectLanguage(code);
    
    // Check if language is supported
    if (Prism.languages[normalizedLang]) {
      const highlighted = Prism.highlight(code, Prism.languages[normalizedLang], normalizedLang);
      return `<pre class="language-${normalizedLang}"><code class="language-${normalizedLang}">${highlighted}</code></pre>`;
    } else {
      // Fallback to plain code block
      return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    }
  } catch (error) {
    console.error('Syntax highlighting error:', error);
    return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  }
};

export const formatMessage = (text: string): string => {
  return text
    // Handle code blocks with language specification (```language\ncode\n```)
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return highlightCode(code.trim(), lang);
    })
    // Handle code blocks without language specification (```\ncode\n```)
    .replace(/```\n([\s\S]*?)\n```/g, (match, code) => {
      return highlightCode(code.trim());
    })
    // Handle single line code blocks (```code```)
    .replace(/```([^`\n]+)```/g, (match, code) => {
      return highlightCode(code.trim());
    })
    // Handle inline code (existing functionality)
    .replace(/`([^`\n]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm font-mono">$1</code>')
    // Handle bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle links
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>');
};

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffMs = now.getTime() - messageTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return messageTime.toLocaleDateString();
};

export const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

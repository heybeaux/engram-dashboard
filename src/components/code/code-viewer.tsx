"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";
// Import core languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import { cn } from "@/lib/utils";

// Custom Apex syntax for Salesforce
Prism.languages.apex = Prism.languages.extend("java", {
  keyword:
    /\b(?:abstract|activate|and|any|array|as|asc|autonomous|begin|bigdecimal|blob|break|bulk|by|byte|case|cast|catch|char|class|collect|commit|const|continue|decimal|default|delete|desc|do|else|end|enum|exception|exit|export|extends|false|final|finally|float|for|from|future|global|goto|group|having|hint|if|implements|import|in|inner|insert|instanceof|interface|into|int|join|like|limit|list|long|loop|map|merge|new|not|null|nulls|number|object|of|on|or|outer|override|package|parallel|pragma|private|protected|public|retrieve|return|returning|rollback|savepoint|search|select|set|short|sort|static|string|super|switch|synchronized|testmethod|then|this|throw|transient|trigger|true|try|type|undelete|update|upsert|using|virtual|webservice|when|where|while|void)\b/i,
  annotation: {
    pattern: /@\w+\b/,
    alias: "punctuation",
  },
});

// Add LWC as JavaScript variant
Prism.languages.lwc = Prism.languages.javascript;

interface CodeViewerProps {
  content: string;
  language: string;
  lineStart?: number;
  highlights?: Array<{ start: number; end: number }>;
  maxLines?: number;
  className?: string;
  showLineNumbers?: boolean;
}

/**
 * Maps file extensions/language identifiers to Prism language keys
 */
function getPrismLanguage(lang: string): string {
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    rb: "ruby",
    apex: "apex",
    cls: "apex",
    trigger: "apex",
    lwc: "javascript",
    html: "markup",
    xml: "markup",
    yml: "yaml",
    sh: "bash",
    zsh: "bash",
    java: "java",
    json: "json",
    sql: "sql",
    css: "css",
    scss: "css",
    md: "markdown",
  };
  return langMap[lang.toLowerCase()] || lang.toLowerCase() || "plaintext";
}

export function CodeViewer({
  content,
  language,
  lineStart = 1,
  highlights = [],
  maxLines,
  className,
  showLineNumbers = true,
}: CodeViewerProps) {
  const codeRef = useRef<HTMLElement>(null);
  const prismLang = getPrismLanguage(language);

  // Truncate content if maxLines specified
  const lines = content.split("\n");
  const displayLines = maxLines ? lines.slice(0, maxLines) : lines;
  const displayContent = displayLines.join("\n");
  const isTruncated = maxLines && lines.length > maxLines;

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [displayContent, prismLang]);

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div className="overflow-x-auto bg-zinc-950 text-zinc-100">
        <pre className="p-0 m-0">
          <div className="flex">
            {/* Line numbers */}
            {showLineNumbers && (
              <div
                className="select-none text-right pr-4 py-4 pl-4 border-r border-zinc-800 text-zinc-500 bg-zinc-900 text-sm font-mono"
                aria-hidden="true"
              >
                {displayLines.map((_, idx) => {
                  const lineNum = lineStart + idx;
                  const isHighlighted = highlights.some(
                    (h) => lineNum >= h.start && lineNum <= h.end
                  );
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "leading-6",
                        isHighlighted && "text-yellow-400 font-medium"
                      )}
                    >
                      {lineNum}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Code content */}
            <code
              ref={codeRef}
              className={`language-${prismLang} block py-4 px-4 text-sm leading-6 font-mono`}
              style={{ tabSize: 2 }}
            >
              {displayContent}
            </code>
          </div>
        </pre>
      </div>
      {isTruncated && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent flex items-end justify-center pb-2">
          <span className="text-xs text-zinc-500">
            +{lines.length - maxLines} more lines
          </span>
        </div>
      )}
    </div>
  );
}

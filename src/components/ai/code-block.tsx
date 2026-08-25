"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const lines = code.split("\n");
  const displayLang = language || (title ? undefined : undefined);

  return (
    <div className="not-prose my-3 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/60 to-muted/30">
      <div className="flex items-center justify-between border-b bg-muted/70 px-4 py-2">
        <div className="flex items-center gap-2.5">
          <Terminal className="size-3.5 text-muted-foreground/50" />
          {displayLang && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {displayLang}
            </span>
          )}
          {title && (
            <span className="text-[11px] text-muted-foreground">{title}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="group">
                <td className="select-none px-3 text-right text-[11px] leading-6 tabular-nums text-muted-foreground/30 group-hover:text-muted-foreground/50">
                  {i + 1}
                </td>
                <td className="whitespace-pre px-4 py-0 font-mono text-[13px] leading-6 text-foreground/90">
                  {line || <span className="select-none">&nbsp;</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CollapsibleCodeBlock({ code, language, title }: CodeBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="not-prose my-3 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/60 to-muted/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2.5">
          {isOpen ? (
            <ChevronDown className="size-4 text-muted-foreground/60" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground/60" />
          )}
          <Terminal className="size-3.5 text-muted-foreground/50" />
          {language && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {language}
            </span>
          )}
          <span className="text-foreground/80">{title || "Code"}</span>
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground/60">
          {code.split("\n").length} lines
        </span>
      </button>
      {isOpen && (
        <div className="border-t">
          <CodeBlock code={code} language={language} />
        </div>
      )}
    </div>
  );
}

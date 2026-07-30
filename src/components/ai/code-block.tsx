"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

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

  return (
    <div className="my-3 overflow-hidden rounded-xl border bg-muted/50">
      <div className="flex items-center justify-between border-b bg-muted/80 px-3 py-1.5">
        <div className="flex items-center gap-2">
          {language && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary">
              {language}
            </span>
          )}
          {title && (
            <span className="text-[11px] text-muted-foreground">{title}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3 text-primary" />
          ) : (
            <Copy className="size-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="group">
                <td className="select-none px-3 text-right text-[11px] text-muted-foreground/40 group-hover:text-muted-foreground/60">
                  {i + 1}
                </td>
                <td className="whitespace-pre px-3 py-0 text-foreground">
                  {line || " "}
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
    <div className="my-3 overflow-hidden rounded-xl border bg-muted/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/80"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
          {language && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary">
              {language}
            </span>
          )}
          <span>{title || "Code"}</span>
        </div>
        <span className="text-[11px]">{code.split("\n").length} lines</span>
      </button>
      {isOpen && (
        <div className="border-t">
          <CodeBlock code={code} language={language} />
        </div>
      )}
    </div>
  );
}

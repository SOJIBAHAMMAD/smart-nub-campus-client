import type { ComponentProps } from "react";
import { CodeBlock, CollapsibleCodeBlock } from "./code-block";
import { QuizCard, type QuizQuestion } from "./quiz-card";
import { FlashcardDeck, type Flashcard } from "./flashcard-deck";
import { SummaryBlock } from "./summary-block";

interface CodeMeta {
  language?: string;
  title?: string;
}

export function detectAndRender(code: string, language: string | undefined) {
  if (language === "json" || language === "jsonc") {
    try {
      const parsed = JSON.parse(code);
      return tryRenderStructured(parsed, { language });
    } catch {}
  }

  if (language === "mermaid") {
    return <CodeBlock code={code} language={language} title="Diagram" />;
  }

  if (code.split("\n").length > 20) {
    return <CollapsibleCodeBlock code={code} language={language} />;
  }

  return <CodeBlock code={code} language={language} />;
}

export function tryRenderStructured(
  data: unknown,
  meta: CodeMeta,
) {
  const obj = data as Record<string, unknown>;

  if (obj.questions && Array.isArray(obj.questions) && obj.questions.length > 0) {
    const questions = obj.questions as QuizQuestion[];
    if (questions[0].question && questions[0].options && questions[0].correctAnswer) {
      return <QuizCard questions={questions} title={meta.title} />;
    }
  }

  if (obj.cards && Array.isArray(obj.cards) && obj.cards.length > 0) {
    const cards = obj.cards as Flashcard[];
    if (cards[0].front && cards[0].back) {
      return <FlashcardDeck cards={cards} title={meta.title} />;
    }
  }

  if (obj.summary && typeof obj.summary === "string") {
    const keyPoints = Array.isArray(obj.keyPoints)
      ? (obj.keyPoints as string[])
      : undefined;
    return <SummaryBlock summary={obj.summary} keyPoints={keyPoints} title={meta.title} />;
  }

  if (Array.isArray(data)) {
    const arr = data as unknown[];
    if (arr.length > 0) {
      const first = arr[0] as Record<string, unknown>;
      if (first.question && first.options && first.correctAnswer) {
        return <QuizCard questions={arr as QuizQuestion[]} title={meta.title} />;
      }
      if (first.front && first.back) {
        return <FlashcardDeck cards={arr as Flashcard[]} title={meta.title} />;
      }
    }
  }

  return null;
}

export function CodeBlockRenderer({
  children,
  className,
  ...props
}: ComponentProps<"code"> & { className?: string }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : undefined;
  const rawCode = String(children);
  const code = rawCode.replace(/^[\n]+|[\n]+$/g, "");

  const structured = detectAndRender(code, language);
  if (structured) {
    return structured;
  }

  // Inline code (no newlines) vs. block code
  if (!rawCode.includes("\n")) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return <CodeBlock code={code} language={language} />;
}

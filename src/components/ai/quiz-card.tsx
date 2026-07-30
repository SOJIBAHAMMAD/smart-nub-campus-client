"use client";

import { useState, useCallback } from "react";
import { Check, X, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizCardProps {
  questions: QuizQuestion[];
  title?: string;
}

export function QuizCard({ questions, title }: QuizCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const question = questions[currentIndex];
  const correctCount = Object.values(answered).filter(Boolean).length;
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = useCallback((option: string) => {
    if (selected) return;
    setSelected(option);
  }, [selected]);

  const handleNext = useCallback(() => {
    if (!selected) return;
    const isCorrect = selected === question.correctAnswer;
    setAnswered((prev) => ({ ...prev, [currentIndex]: isCorrect }));
    setSelected(null);
    if (isLast) {
      setShowResult(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [selected, question, currentIndex, isLast]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswered({});
    setShowResult(false);
  }, []);

  if (showResult) {
    return (
      <div className="my-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          <h4 className="text-sm font-semibold">{title || "Quiz Results"}</h4>
        </div>
        <div className="mt-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {correctCount}/{questions.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {correctCount === questions.length
              ? "Perfect score!"
              : correctCount >= questions.length / 2
                ? "Good job!"
                : "Keep practicing!"}
          </p>
        </div>
        <div className="mt-4 space-y-1.5">
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {answered[i] ? (
                <Check className="size-3.5 shrink-0 text-primary" />
              ) : (
                <X className="size-3.5 shrink-0 text-destructive" />
              )}
              <span className="line-clamp-1 text-muted-foreground">
                {q.question}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={handleRestart}
          className="mt-4 w-full rounded-lg bg-primary/10 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-4 text-primary" />
          <h4 className="text-sm font-semibold">{title || "Quiz"}</h4>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm font-medium leading-relaxed">
            {question.question}
          </p>

          <div className="mt-3 space-y-1.5">
            {question.options.map((option) => {
              const isSelected = selected === option;
              const isCorrect = option === question.correctAnswer;
              const showCorrect = selected && isCorrect;
              const showWrong = selected && isSelected && !isCorrect;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={!!selected}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all",
                    !selected && "hover:border-primary/40 hover:bg-primary/5",
                    isSelected && "border-primary/50 bg-primary/10",
                    showCorrect && "border-primary bg-primary/10 text-primary",
                    showWrong && "border-destructive bg-destructive/10 text-destructive",
                    selected && "cursor-default",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
                      isSelected
                        ? "border-primary/30 bg-primary text-primary-foreground"
                        : "border-border",
                      showCorrect && "border-primary bg-primary text-primary-foreground",
                      showWrong && "border-destructive bg-destructive text-destructive-foreground",
                    )}
                  >
                    {showCorrect ? (
                      <Check className="size-3" />
                    ) : showWrong ? (
                      <X className="size-3" />
                    ) : (
                      String.fromCharCode(65 + question.options.indexOf(option))
                    )}
                  </span>
                  <span className="leading-snug">{option}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {selected && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {isLast ? "Show Results" : "Next Question"}
          <ChevronRight className="size-3.5" />
        </motion.button>
      )}

      <div className="mt-3 flex justify-center gap-1">
        {questions.map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full transition-colors",
              i === currentIndex
                ? "bg-primary"
                : answered[i] !== undefined
                  ? answered[i]
                    ? "bg-primary/40"
                    : "bg-destructive/40"
                  : "bg-muted-foreground/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}

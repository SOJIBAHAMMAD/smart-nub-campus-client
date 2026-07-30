"use client";

import { useState, useCallback } from "react";
import { Layers, RotateCw, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardDeckProps {
  cards: Flashcard[];
  title?: string;
}

export function FlashcardDeck({ cards, title }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());

  const card = cards[currentIndex];
  const progress = Math.round((shown.size / cards.length) * 100);

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
    if (!isFlipped) {
      setShown((prev) => new Set(prev).add(currentIndex));
    }
  }, [isFlipped, currentIndex]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i + 1) % cards.length);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const handleShuffle = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * cards.length));
    setShown(new Set());
  }, [cards.length]);

  return (
    <div className="my-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <h4 className="text-sm font-semibold">
            {title || "Flashcards"}
          </h4>
        </div>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Shuffle className="size-3" />
          Shuffle
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {currentIndex + 1} / {cards.length}
        </span>
        <span>{progress}% seen</span>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.button
          key={`${currentIndex}-${isFlipped}`}
          onClick={handleFlip}
          initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
          transition={{ duration: 0.25 }}
          className="mt-3 flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors hover:border-primary/40"
        >
          {isFlipped ? (
            <p className="text-sm leading-relaxed text-foreground">{card.back}</p>
          ) : (
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <RotateCw className="size-3" />
                Tap to reveal
              </span>
              <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
                {card.front}
              </p>
            </div>
          )}
        </motion.button>
      </AnimatePresence>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </button>
        <span className="text-[11px] text-muted-foreground">
          {isFlipped ? "Answer" : "Question"}
        </span>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
        >
          Next
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

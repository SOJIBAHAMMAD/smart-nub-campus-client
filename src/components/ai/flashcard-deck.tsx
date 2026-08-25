"use client";

import { useState, useCallback, useRef } from "react";
import { Layers, RotateCw, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import {
  CardFlip,
  CardFlipFront,
  CardFlipBack,
  CardFlipContent,
} from "@/components/ui/card-flip";

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
  const revealedRef = useRef<Set<number>>(new Set());
  const [revealedCount, setRevealedCount] = useState(0);

  const card = cards[currentIndex];
  const progress = Math.round((revealedCount / cards.length) * 100);

  const handleReveal = useCallback(() => {
    if (!revealedRef.current.has(currentIndex)) {
      revealedRef.current.add(currentIndex);
      setRevealedCount((c) => c + 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % cards.length);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const handleShuffle = useCallback(() => {
    setCurrentIndex(Math.floor(Math.random() * cards.length));
    revealedRef.current = new Set();
    setRevealedCount(0);
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
        <span>{revealedCount} / {cards.length} seen</span>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3" key={currentIndex}>
        <CardFlip flipOnClick onFlip={handleReveal}>
          <CardFlipFront>
            <CardFlipContent>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <RotateCw className="size-3" />
                Tap to reveal
              </span>
              <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
                {card.front}
              </p>
            </CardFlipContent>
          </CardFlipFront>
          <CardFlipBack>
            <CardFlipContent>
              <p className="text-sm leading-relaxed text-foreground">{card.back}</p>
            </CardFlipContent>
          </CardFlipBack>
        </CardFlip>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </button>
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

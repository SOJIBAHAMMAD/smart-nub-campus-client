"use client";

import { PeopleCard, type PeopleCardUser } from "./people-card";

interface SuggestedPeopleProps {
  people: PeopleCardUser[];
  onChanged?: () => void;
}

/**
 * Sidebar list of suggested connections ("People You May Know"), showing the
 * top few candidates with the highest mutual-connection score.
 */
export function SuggestedPeople({ people, onChanged }: SuggestedPeopleProps) {
  if (people.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Check back later for people you may know.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {people.map((person) => (
        <PeopleCard
          key={person.id}
          user={person}
          compact
          showMutual
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

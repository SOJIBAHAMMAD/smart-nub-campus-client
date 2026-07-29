"use client";

import { useState } from "react";
import { CheckCircle, Pencil, Loader2, X, Save } from "lucide-react";
import type { Answer } from "@/types/qa.types";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorInfo } from "@/components/ui/author-info";
import { VoteControls } from "@/components/ui/vote-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextEditor, RichTextEditorContent, RichTextEditorToolbar } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  answer: Answer;
  isQuestionAuthor: boolean;
  currentUserId?: string | null;
  onVote: (answerId: string, type: "UP" | "DOWN") => void;
  onAccept: (answerId: string) => void;
  onEdit: (answerId: string, content: string) => Promise<void>;
}

export function AnswerCard({
  answer,
  isQuestionAuthor,
  currentUserId,
  onVote,
  onAccept,
  onEdit,
}: AnswerCardProps) {
  const userVote = (answer.userVote ?? null) as "UP" | "DOWN" | null;
  const isAnswerAuthor = currentUserId != null && answer.authorId === currentUserId;

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const stripped = editContent.replace(/<[^>]*>?/gm, "").trim();
    if (stripped.length < 1) return;

    setSaving(true);
    try {
      await onEdit(answer.id, editContent);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditContent(answer.content);
    setEditing(false);
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        answer.isAccepted && "border-success/50 bg-success/[0.03] ring-1 ring-success/20",
      )}
    >
      {answer.isAccepted && (
        <div className="absolute left-0 top-0 h-full w-0.5 bg-success" />
      )}
      <CardContent className="flex gap-3 py-4 sm:gap-4">
        {/* Vote column */}
        <div className="flex shrink-0 flex-col items-center">
          <VoteControls
            upvotes={answer.upvoteCount}
            activeVote={userVote}
            onVote={(type) => onVote(answer.id, type)}
            orientation="vertical"
            size="sm"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {/* Accepted badge */}
          {answer.isAccepted && (
            <Badge className="h-6 gap-1 rounded-full bg-success/15 px-2.5 text-xs font-semibold text-success ring-1 ring-success/30">
              <CheckCircle className="size-3.5" />
              ACCEPTED ANSWER
            </Badge>
          )}

          {/* Content or edit form */}
          {editing ? (
            <div className="space-y-2">
              <RichTextEditor
                value={editContent}
                onChange={setEditContent}
                placeholder="Edit your answer..."
              >
                <RichTextEditorToolbar />
                <RichTextEditorContent className="min-h-40" />
              </RichTextEditor>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="size-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || editContent.replace(/<[^>]*>?/gm, "").trim().length < 1}
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: answer.content }}
            />
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
            {answer.author && (
              <div className="flex items-center gap-1.5">
                <AuthorInfo
                  user={{
                    id: answer.authorId,
                    name: answer.author.name ?? "Unknown",
                    image: answer.author.image,
                  }}
                  timestamp={answer.createdAt}
                  size="sm"
                />
                {answer.updatedAt !== answer.createdAt && (
                  <span className="text-[11px] text-muted-foreground/60 italic">
                    (edited)
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {isAnswerAuthor && !editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="gap-1"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}

              {isQuestionAuthor && (
                <Button
                  variant={answer.isAccepted ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAccept(answer.id)}
                  disabled={answer.isAccepted}
                  className={cn(
                    "gap-1",
                    answer.isAccepted
                      ? "cursor-default bg-success/10 text-success hover:bg-success/15"
                      : "",
                  )}
                >
                  <CheckCircle className="size-3.5" />
                  {answer.isAccepted ? "Accepted" : "Accept"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

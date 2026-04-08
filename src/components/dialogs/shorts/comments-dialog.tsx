"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "#convex/_generated/api";
import { Doc, Id } from "#convex/_generated/dataModel";
import { ResponsiveDialog } from "@/components/dialogs/layout";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CommentsDialogProps {
  videoId: string;
  children: React.ReactNode;
}

type Comment = Doc<"shortComments">;

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-muted flex items-center justify-center">
      {image ? (
        <Image src={image} alt={name ?? "Usuario"} width={28} height={28} className="object-cover w-full h-full" />
      ) : (
        <span className="text-[11px] font-medium text-muted-foreground uppercase">
          {(name ?? "U")[0]}
        </span>
      )}
    </div>
  );
}

function ReplyInput({
  videoId,
  parentId,
  onDone,
}: {
  videoId: string;
  parentId: Id<"shortComments">;
  onDone: () => void;
}) {
  const addComment = useMutation(api.shortComments.addComment);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addComment({ videoId, text, parentId });
      setText("");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al responder");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
    if (e.key === "Escape") onDone();
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <textarea
        autoFocus
        value={text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe una respuesta... (⌘+Enter para enviar)"
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        rows={2}
        maxLength={500}
        disabled={loading}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{text.length}/500</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onDone} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading || !text.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Responder"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  videoId,
  isReply = false,
}: {
  comment: Comment;
  replies: Comment[];
  videoId: string;
  isReply?: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={cn("flex gap-2.5", isReply && "ml-9")}>
      <Avatar name={comment.authorName} image={comment.authorImage} />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-xs font-semibold text-foreground">{comment.authorName ?? "Usuario"}</span>
        <p className="text-sm text-muted-foreground leading-snug break-words">{comment.text}</p>

        {/* Actions */}
        {!isReply && (
          <div className="flex items-center gap-3 mt-0.5">
            <RequireAuth mode="wrap">
              <button
                onClick={() => setShowReplyInput((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Responder
              </button>
            </RequireAuth>
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}
              </button>
            )}
          </div>
        )}

        {/* Reply input */}
        {showReplyInput && (
          <ReplyInput
            videoId={videoId}
            parentId={comment._id}
            onDone={() => {
              setShowReplyInput(false);
              setShowReplies(true);
            }}
          />
        )}

        {/* Nested replies */}
        {showReplies && replies.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} replies={[]} videoId={videoId} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsContent({ videoId }: { videoId: string }) {
  const allComments = useQuery(api.shortComments.getComments, { videoId });
  const addComment = useMutation(api.shortComments.addComment);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topLevel = allComments?.filter((c) => !c.parentId) ?? [];
  const repliesMap = new Map<string, Comment[]>();
  for (const c of allComments ?? []) {
    if (c.parentId) {
      const key = c.parentId.toString();
      if (!repliesMap.has(key)) repliesMap.set(key, []);
      repliesMap.get(key)!.push(c);
    }
  }

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addComment({ videoId, text });
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar el comentario");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <div className="flex flex-col gap-4 px-5 pb-5 pt-2 w-full max-h-[70vh]">
      <h2 className="text-base font-semibold">Comentarios</h2>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0 max-h-[45vh]">
        {allComments === undefined && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {allComments !== undefined && topLevel.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Sé el primero en comentar
          </p>
        )}
        {topLevel.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            replies={repliesMap.get(comment._id.toString()) ?? []}
            videoId={videoId}
          />
        ))}
      </div>

      {/* New comment input */}
      <div className="border-t pt-4">
        <RequireAuth
          mode="button"
          buttonLabel="Iniciar sesión para comentar"
          buttonClassName="w-full"
        >
          <div className="flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un comentario... (⌘+Enter para enviar)"
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{text.length}/500</span>
              <Button size="sm" onClick={handleSubmit} disabled={loading || !text.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Comentar"}
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </RequireAuth>
      </div>
    </div>
  );
}

export function CommentsDialog({ videoId, children }: CommentsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog
      isOpen={open}
      setIsOpen={setOpen}
      contentClassName="sm:max-w-[600px]"
      content={<CommentsContent videoId={videoId} />}
    >
      <span onClick={() => setOpen(true)} className={cn("flex flex-col items-center gap-1 group cursor-pointer")}>
        {children}
      </span>
    </ResponsiveDialog>
  );
}

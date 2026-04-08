"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "#convex/_generated/api";
import { ResponsiveDialog } from "@/components/dialogs/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CommentsDialogProps {
  videoId: string;
  children: React.ReactNode;
}

function CommentsContent({ videoId }: { videoId: string }) {
  const { isSignedIn } = useUser();
  const comments = useQuery(api.shortComments.getComments, { videoId });
  const addComment = useMutation(api.shortComments.addComment);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-4 px-5 pb-5 pt-2 w-full max-h-[70vh]">
      <h2 className="text-base font-semibold">Comentarios</h2>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0 max-h-[45vh]">
        {comments === undefined && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {comments?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Sé el primero en comentar
          </p>
        )}
        {comments?.map((comment) => (
          <div key={comment._id} className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {comment.authorImage ? (
                <Image
                  src={comment.authorImage}
                  alt={comment.authorName ?? "Usuario"}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {(comment.authorName ?? "U")[0]}
                </span>
              )}
            </div>
            {/* Content */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground">
                {comment.authorName ?? "Usuario"}
              </span>
              <p className="text-sm text-muted-foreground leading-snug">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      {isSignedIn ? (
        <div className="flex flex-col gap-3 border-t pt-4">
          <textarea
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comentario... (⌘+Enter para enviar)"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            rows={4}
            maxLength={500}
            disabled={loading}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length}/500</span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Comentar"}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center border-t pt-3">
          Inicia sesión para comentar
        </p>
      )}
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

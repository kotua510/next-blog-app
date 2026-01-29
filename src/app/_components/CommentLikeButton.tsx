"use client";
import { useState } from "react";

export default function CommentLikeButton({
  commentId,
  initialCount,
  initialLiked,
}: {
  commentId: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleLike = async () => {
    const res = await fetch(`/api/comments/${commentId}/like`, {
      method: liked ? "DELETE" : "POST",
    });

    if (res.ok) {
      setLiked(!liked);
      setCount((c) => (liked ? c - 1 : c + 1));
    }
  };

  return (
    <button onClick={handleLike} className="text-sm">
      {liked ? "❤️" : "🤍"} {count}
    </button>
  );
}

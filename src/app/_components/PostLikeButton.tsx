"use client";
import { useState } from "react";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function PostLikeButton({
  postId,
  initialLiked,
  initialCount,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    const res = await fetch(`/api/posts/${postId}/like`, {
      method: liked ? "DELETE" : "POST",
    });

    if (res.ok) {
      setLiked(!liked);
      setCount((c) => (liked ? c - 1 : c + 1));
    }

    setLoading(false);
  };

  return (
    <button onClick={handleLike} className="flex items-center gap-2">
      <span className={liked ? "text-red-500" : ""}>❤️</span>
      {count}
    </button>
  );
}

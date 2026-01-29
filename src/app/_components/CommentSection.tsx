"use client";
import { useState } from "react";
import CommentLikeButton from "./CommentLikeButton";

type Comment = {
  id: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
};

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: text }),
    });

    if (!res.ok) return;

    const newComment = await res.json();
    setComments([newComment, ...comments]);
    setText("");
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="font-bold">コメント</h3>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 flex-1"
          placeholder="コメントを書く"
        />
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-3">
          送信
        </button>
      </div>

      {comments.map((c) => (
        <div key={c.id} className="border p-2">
          <p>{c.content}</p>
          <CommentLikeButton
            commentId={c.id}
            initialCount={c.likeCount}
            initialLiked={c.likedByMe}
          />
        </div>
      ))}
    </div>
  );
}

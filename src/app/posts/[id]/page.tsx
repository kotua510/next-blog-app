"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { PostForDetail } from "@/app/_types/PostForDetail";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { supabase } from "@/utils/supabase";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  liked: boolean;
  likeLoading?: boolean;
};

type RecommendedPost = {
  id: string;
  title: string;
  coverImageKey?: string | null;
};

const Page: React.FC = () => {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<PostForDetail | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [postLikes, setPostLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [recommended, setRecommended] = useState<RecommendedPost[]>([]);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((d) => setPost(d));
  }, [id]);

  useEffect(() => {
    fetch(`/api/posts/${id}/like`)
      .then((r) => r.json())
      .then((d) => {
        setPostLikes(d.count);
        setLiked(d.liked);
      });
  }, [id]);

  useEffect(() => {
    fetch(`/api/posts/${id}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d));
  }, [id]);

useEffect(() => {
  fetch(`/api/posts/${id}/recommend`)
    .then((r) => r.json())
    .then((d) => setRecommended(d))
    .catch(() => setRecommended([]));
}, [id]);

  useEffect(() => {
    if (!post?.coverImageKey) return;
    const { data } = supabase.storage
      .from("cover-image")
      .getPublicUrl(post.coverImageKey);
    setCoverImageUrl(data.publicUrl);
  }, [post]);

  if (!post) return <div>Loading...</div>;

  const safeHTML = DOMPurify.sanitize(post.content);
const getImageUrl = (key?: string | null) => {
  if (!key) return null;
  const { data } = supabase.storage.from("cover-image").getPublicUrl(key);
  return data.publicUrl;
};

  const togglePostLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    try {
      if (liked) {
        await fetch(`/api/posts/${id}/like`, { method: "DELETE" });
        setPostLikes((c) => c - 1);
        setLiked(false);
      } else {
        await fetch(`/api/posts/${id}/like`, { method: "POST" });
        setPostLikes((c) => c + 1);
        setLiked(true);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  // 禁則文字リスト
  const NG_WORDS = [
  "死ね",
  "ばか",
  "アホ",
  "fuck",
  "shit",
  "くそ",
  "禁則ワード1",
  "禁則ワード2"
];

const containsNgWord = (text: string) => {
  return NG_WORDS.some((word) => text.includes(word));
};

const submitComment = async () => {
  const trimmed = newComment.trim();
  if (!trimmed) return;

  if (containsNgWord(trimmed)) {
    alert("禁止されている単語が含まれています");
    return;
  }

  const res = await fetch(`/api/posts/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: trimmed }),
  });

  if (!res.ok) {
    alert("コメント投稿に失敗しました");
    return;
  }

  const comment = await res.json();
  setComments((prev) => [{ ...comment, liked: false }, ...prev]);
  setNewComment("");
};

  const toggleCommentLike = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likeLoading: true } : c
      )
    );

    const target = comments.find((c) => c.id === commentId);
    if (!target) return;

    try {
      if (target.liked) {
        await fetch(`/api/comment/${commentId}/like`, { method: "DELETE" });

        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likeCount: c.likeCount - 1,
                  liked: false,
                  likeLoading: false,
                }
              : c
          )
        );
      } else {
        const res = await fetch(`/api/comment/${commentId}/like`, {
          method: "POST",
        });

        if (res.ok) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    likeCount: c.likeCount + 1,
                    liked: true,
                    likeLoading: false,
                  }
                : c
            )
          );
        }
      }
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likeLoading: false } : c
        )
      );
    }
  };

const RecommendedImage: React.FC<{
  imageKey: string;
  title: string;
}> = ({ imageKey, title }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.storage
      .from("cover-image")
      .getPublicUrl(imageKey);

    setUrl(data.publicUrl);
  }, [imageKey]);

  if (!url) {
    return (
      <div className="w-full h-20 bg-gray-200 rounded mb-2" />
    );
  }

  return (
    <Image
      src={url}
      alt={title}
      width={300}
      height={150}
      className="w-full h-20 object-cover rounded mb-2"
    />
  );
};

  return (
  <main className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
    <h1 className="text-2xl md:text-4xl font-bold break-words">
      {post.title}
    </h1>

    <div className="flex gap-2 flex-wrap">
      {post.categories.map((c) => (
        <span
          key={c.id}
          className="px-2 py-1 border rounded text-xs md:text-sm"
        >
          {c.name}
        </span>
      ))}
    </div>

    <button
      onClick={togglePostLike}
      disabled={likeLoading}
      className={`text-xl md:text-2xl font-bold flex items-center gap-2 transition ${
        liked ? "text-red-600" : "text-gray-400"
      }`}
    >
      {liked ? "❤️" : "🤍"} {postLikes}
    </button>

    {post.resultUrl && (
      <div className="my-4 text-base md:text-xl">
        <span className="font-semibold">成果物はこちら : </span>
        <a
          href={post.resultUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all hover:text-blue-800 font-semibold"
        >
          {post.resultUrl}
        </a>
      </div>
    )}

    {coverImageUrl && (
      <Image
        src={coverImageUrl}
        alt={post.title}
        width={400}
        height={200}
        className="rounded-xl w-full max-w-2xl mx-auto"
      />
    )}

    <div
      className="prose max-w-none text-[18px] md:text-[22px] leading-relaxed break-words overflow-wrap-anywhere"
      dangerouslySetInnerHTML={{ __html: safeHTML }}
    />

    {recommended.length > 0 && (
      <div className="border-t pt-6 space-y-3">
        <h2 className="text-xl md:text-2xl font-bold">
          おすすめ記事📝
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {recommended.map((r) => (
            <a
              key={r.id}
              href={`/posts/${r.id}`}
              className="min-w-[160px] md:min-w-[180px]
                        max-w-[160px] md:max-w-[180px]
                        flex-shrink-0
                        border rounded-lg p-2 bg-white
                        hover:shadow-md transition"
            >
              {r.coverImageKey && (
                <RecommendedImage
                  imageKey={r.coverImageKey}
                  title={r.title}
                />
              )}

              <div className="text-xs font-semibold line-clamp-2 break-words">
                {r.title}
              </div>
            </a>
          ))}
        </div>
      </div>
    )}

    <div className="border-t pt-6 space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">コメント💬</h2>

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="コメントを書く..."
        className="w-full border rounded p-2 text-sm md:text-base"
      />

      <button
        onClick={submitComment}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        送信
      </button>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="border p-3 rounded">
            <div className="text-gray-800 break-words">
              {c.content}
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>
                {new Date(c.createdAt).toLocaleString()}
              </span>

              <button
                onClick={() => toggleCommentLike(c.id)}
                disabled={c.likeLoading}
                className={`flex items-center gap-1 transition ${
                  c.liked ? "text-red-600" : "text-gray-400"
                }`}
              >
                {c.liked ? "❤️" : "🤍"} {c.likeCount}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);
};

export default Page;

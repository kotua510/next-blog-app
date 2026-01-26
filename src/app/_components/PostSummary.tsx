"use client";
import Link from "next/link";
import type { Post } from "@/app/_types/Post";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";

type Props = {
  post: Post;
};

const PostSummary: React.FC<Props> = ({ post }) => {
  const dtFmt = "YYYY-MM-DD";
  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  return (
    <div className="border border-slate-400 p-3">
      {/* 日付 & カテゴリ */}
      <div className="mb-2 flex items-center justify-between">
        <div>{dayjs(post.createdAt).format(dtFmt)}</div>

        <div className="flex flex-wrap gap-1.5">
          {post.categories.map((category) => (
            <div
              key={category.id}
              className="rounded border border-gray-300 px-2 py-0.5 text-sm"
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>

      {/* タイトル（リンクボタン） */}
      <Link
        href={`/posts/${post.id}`}
        className="mb-1 inline-block text-lg font-bold text-blue-600 hover:underline hover:text-blue-700"
      >
        {post.title}
      </Link>

      {/* 本文抜粋 */}
      <div
        className="line-clamp-3 text-sm text-gray-700"
        dangerouslySetInnerHTML={{ __html: safeHTML }}
      />
    </div>
  );
};

export default PostSummary;

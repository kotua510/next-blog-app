"use client";
import Link from "next/link";
import type { Post } from "@/app/_types/Post";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";
import { useState, useEffect } from "react";

type Props = { post: Post };

const PostSummary: React.FC<Props> = ({ post }) => {
  const dtFmt = "YYYY-MM-DD";
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState(post.summary ?? "");

  useEffect(() => {
    setSummary(post.summary ?? "");
  }, [post.summary]);

  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  const handleSummarize = () => {
    if (!summary) {
      alert("要約が設定されていません");
      return;
    }
    setIsOpen(true);
  };

  return (
    <div
      className="
        border
        p-5
        rounded-xl
        bg-white
        hover:shadow-md
        transition
      "
    >
      <div className="text-sm text-gray-500 mb-2">
        {dayjs(post.createdAt).format(dtFmt)}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        <div className="flex-1 min-w-0 break-words">
          <Link
            href={`/posts/${post.id}`}
            className="mb-2 block text-xl font-extrabold text-blue-600 hover:underline break-words"
          >
            {post.title}
          </Link>

          <div
            className="line-clamp-3 text-base text-gray-700 break-words"
            dangerouslySetInnerHTML={{ __html: safeHTML }}
          />
        </div>

        <div className="flex sm:w-64 flex-col sm:items-end sm:text-right">
          <div className="flex flex-wrap justify-start sm:justify-end gap-2 mb-3">
            {post.categories.map((c) => (
              <div
                key={c.id}
                className="
                  rounded
                  border
                  border-gray-300
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                "
              >
                {c.name}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <button
              onClick={handleSummarize}
              className="
                px-3 py-1.5
                bg-purple-600
                text-white
                rounded
                text-sm
                font-semibold
                hover:bg-purple-700
                transition
              "
            >
              要約
            </button>

            <span className="text-base font-semibold">
              ❤️ {post.likeCount}
            </span>

            <span className="text-base font-semibold">
              💬 {post.commentCount}
            </span>
          </div>
        </div>
      </div>

      {/* モーダル */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-[720px] max-w-[90vw] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold mb-3 text-lg">作者による要約</h2>
            <p className="text-xl whitespace-pre-wrap break-words">
              {summary}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 text-blue-600 hover:underline"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostSummary;
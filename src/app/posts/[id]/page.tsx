"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import type { PostForDetail } from "@/app/_types/PostForDetail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

import DOMPurify from "isomorphic-dompurify";
import { supabase } from "@/utils/supabase";

// 投稿記事の詳細表示 /posts/[id]
const Page: React.FC = () => {
  const [post, setPost] = useState<PostForDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  // 動的ルートパラメータ
  const { id } = useParams() as { id: string };

  // 記事取得
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/posts/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const data = (await res.json()) as PostForDetail;
        setPost(data);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // 画像URL生成（public bucket）
  useEffect(() => {
    if (!post) return;
  console.log("📦 post full object", post);
  console.log("🧩 coverImageKey type:", typeof post.coverImageKey);
  console.log("🧩 coverImageKey value:", post.coverImageKey);
  const key = post?.coverImageKey;
  if (!key) {
    console.log("❌ key is null", post);
    return;
  }

  const { data } = supabase.storage
    .from("cover-image")
    .getPublicUrl(key);

  console.log("✅ coverImageKey:", key);
  console.log("🔗 image url:", data.publicUrl);

  setCoverImageUrl(data.publicUrl);
}, [post]);


  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!post) {
    return <div>指定idの投稿の取得に失敗しました。</div>;
  }

  // HTMLサニタイズ
  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  return (
    <main>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>

        <div className="flex flex-wrap gap-2">
  {post.categories.map((category) => (
    <span
      key={category.id}
      className="px-3 py-1 text-sm border rounded"
    >
      {category.name}
    </span>
  ))}
</div>

        {coverImageUrl && (
          <Image
            src={coverImageUrl}
            alt={post.title}
            width={800}
            height={450}
            className="rounded-xl"
            priority
          />
        )}

        <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
      </div>
    </main>
  );
};

export default Page;

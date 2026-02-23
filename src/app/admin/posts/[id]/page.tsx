"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/app/_hooks/useAuth";
import Image from "next/image";


type Category = {
  id: string;
  name: string;
};

type EditPostResponse = {
  id: string;
  title: string;
  content: string;
  coverImageKey?: string | null;
  summary?: string | null;
  resultUrl?: string | null;
  categories: {
    id: string;
    name: string;
  }[];
};

/* 🆕 コメント型 */
type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

type CategoryView = "col2" | "col3";

const EditPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, isLoading: authLoading, session } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageKey, setCoverImageKey] = useState<string | null>(null);

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState("");


  const [categoryView, setCategoryView] =
  useState<CategoryView>("col2");
  const [categorySearch, setCategorySearch] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null);

  /* 🆕 コメント管理用state */
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const isInvalidUrl =
  resultUrl.length > 0 &&
  !/^https?:\/\//i.test(resultUrl);

  /* ---------------- 初期データ取得 ---------------- */
  useEffect(() => {
    if (authLoading || !token) return;

    const fetchData = async () => {
      try {
        const postRes = await fetch(`/api/admin/posts/${id}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!postRes.ok) throw new Error();

        const post: EditPostResponse = await postRes.json();

        setTitle(post.title);
        setContent(post.content);
        setSummary(post.summary ?? "");
        setResultUrl(post.resultUrl ?? "");
        setCoverImageKey(post.coverImageKey ?? null);
        setCategoryIds(post.categories.map((c) => c.id));

        if (post.coverImageKey) {
          const { data } = await supabase.storage
            .from("cover-image")
            .createSignedUrl(post.coverImageKey, 60 * 5);

          setStoredImageUrl(data?.signedUrl ?? null);
        }

        const catRes = await fetch("/api/categories", { cache: "no-store" });
        if (!catRes.ok) throw new Error();
        setAllCategories(await catRes.json());
      } catch {
        alert("データの取得に失敗しました");
        router.push("/admin/posts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, authLoading, router]);

  /* 🆕 コメント取得 */
  useEffect(() => {
    if (!id) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/posts/${id}/comments`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error();
        setComments(await res.json());
      } catch {
        alert("コメント取得失敗");
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  /* ---------------- カテゴリ検索 ---------------- */
  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [allCategories, categorySearch]);

  const toggleCategory = (categoryId: string) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  /* ---------------- 画像アップロード ---------------- */
  const handleImageUpload = async (file: File) => {
    if (!session) {
      alert("ログイン情報がありません");
      return;
    }

    const ext = file.name.split(".").pop();
    const fileName = `private/covers/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("cover-image")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error(error);
      alert("画像アップロード失敗");
      return;
    }

    setCoverImageKey(fileName);
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  /* ---------------- 更新 ---------------- */
  const handleUpdate = async () => {
  const {
    data: { user },
    } = await supabase.auth.getUser();
    


  if (user?.is_anonymous) {
    alert("ゲストユーザーは更新できません");
    return;
    }
    
  if (resultUrl && !resultUrl.startsWith("http")) {
  alert("URLはhttpから始めてください");
  return;
}


  const res = await fetch(`/api/admin/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, coverImageKey, categoryIds, resultUrl,summary, }),
  });

  if (!res.ok) {
    alert("更新に失敗しました");
    return;
  }

  router.push("/admin/posts");
};


  /* ---------------- 削除 ---------------- */
  const handleDelete = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.is_anonymous) {
    alert("ゲストユーザーは削除できません");
    return;
  }

  if (!confirm("この投稿を削除しますか？")) return;

  const res = await fetch(`/api/admin/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    alert("削除に失敗しました");
    return;
  }

  router.push("/admin/posts");
};


  /* 🆕 コメント削除 */
  const handleCommentDelete = async (commentId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.is_anonymous) {
    alert("ゲストユーザーはコメントを削除できません");
    return;
  }

  if (!confirm("このコメントを削除しますか？")) return;

  const res = await fetch(`/api/posts/${id}/comments`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ commentId }),
  });

  if (!res.ok) {
    alert("コメント削除失敗");
    return;
  }

  setComments((prev) => prev.filter((c) => c.id !== commentId));
};


  if (loading) return <div>Loading...</div>;

  return (
  <main className="space-y-6 max-w-4xl mx-auto px-4">
    {/* ===== スマホ：リンク最上部 ===== */}
    <div className="flex flex-col gap-2 sm:hidden">
      <Link href="/admin/posts" className="px-3 py-2 bg-gray-200 rounded text-center">
        投稿記事一覧
      </Link>
      <Link href="/admin" className="px-3 py-2 bg-gray-200 rounded text-center">
        管理画面トップ
      </Link>
    </div>

    {/* ===== ヘッダー ===== */}
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-bold">投稿編集</h1>

      {/* PCのみ */}
      <div className="hidden sm:flex gap-2">
        <Link href="/admin/posts" className="px-3 py-2 bg-gray-200 rounded">
          投稿記事一覧
        </Link>
        <Link href="/admin" className="px-3 py-2 bg-gray-200 rounded">
          管理画面トップ
        </Link>
      </div>
    </header>

    <div>
      <label className="font-semibold block mb-1">タイトル</label>
      <input
        className="border p-2 w-full"
        value={title ?? ""}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>

    <div>
      <label className="font-semibold block mb-1">本文</label>
      <textarea
        className="border p-2 w-full h-40"
        value={content ?? ""}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>

    <div className="relative">
      <label className="block font-semibold mb-1">
        要約（150文字以内）
      </label>

      <textarea
        className="border p-2 w-full h-24 pr-14"
        value={summary ?? ""}
        maxLength={150}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="ユーザーに興味を持ってもらうための要約を書きましょう"
      />

      <div
        className={`absolute bottom-2 right-3 text-xs ${
          summary.length >= 150 ? "text-red-500" : "text-gray-500"
        }`}
      >
        {summary.length}/150
      </div>
    </div>

    <div>
      <label className="font-semibold block mb-1">
        成果物URL
      </label>

      <input
        type="url"
        value={resultUrl ?? ""}
        onChange={(e) => setResultUrl(e.target.value)}
        placeholder="https://example.com"
        className={`border p-2 w-full rounded-md border-2 ${
          isInvalidUrl ? "border-red-500" : ""
        }`}
      />

      {isInvalidUrl && (
        <div className="mt-1 text-sm text-red-500">
          httpかhttpsで始めてください
        </div>
      )}
    </div>

    <div>
      <label
        htmlFor="cover-image"
        className="inline-block cursor-pointer rounded-md bg-indigo-500 px-5 py-1 font-bold text-white hover:bg-indigo-600"
      >
        画像を選択
      </label>

      <input
        id="cover-image"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          if (!e.target.files?.[0]) return;
          const file = e.target.files[0];
          setImagePreviewUrl(URL.createObjectURL(file));
          await handleImageUpload(file);
        }}
      />

      {imagePreviewUrl ? (
        <Image
          src={imagePreviewUrl}
          alt="選択中のプレビュー画像"
          width={128}
          height={128}
          className="mt-2 rounded border object-contain"
          unoptimized
        />
      ) : (
        storedImageUrl && (
          <Image
            src={storedImageUrl}
            alt="保存済みカバー画像"
            width={128}
            height={128}
            className="mt-2 rounded border object-contain"
            unoptimized
          />
        )
      )}
    </div>

    {/* ===== カテゴリ ===== */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="font-semibold">カテゴリ</label>

        {/* PCのみ列変更 */}
        <div className="ml-auto hidden sm:flex gap-2">
          <button
            type="button"
            onClick={() => setCategoryView("col2")}
            className={`px-2 py-1 rounded border text-sm ${
              categoryView === "col2"
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            2列
          </button>

          <button
            type="button"
            onClick={() => setCategoryView("col3")}
            className={`px-2 py-1 rounded border text-sm ${
              categoryView === "col3"
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            3列
          </button>
        </div>
      </div>

      <input
        className="border px-2 py-1 w-full mb-3 rounded"
        placeholder="カテゴリ検索"
        value={categorySearch ?? ""}
        onChange={(e) => setCategorySearch(e.target.value)}
      />

      {/* ✅ スマホ2列固定 */}
      <div
        className={`grid gap-2 grid-cols-2 ${
          categoryView === "col3" ? "sm:grid-cols-3" : ""
        }`}
      >
        {filteredCategories.map((cat) => {
          const selected = categoryIds.includes(cat.id);

          return (
            <label
              key={cat.id}
              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-50 rounded"
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded border transition
                  ${selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-400"}
                `}
              >
                {selected && (
                  <span className="text-white text-[10px] leading-none">✓</span>
                )}
              </span>

              <input
                type="checkbox"
                className="hidden"
                checked={selected}
                onChange={() => toggleCategory(cat.id)}
              />

              <span className="text-sm break-words">{cat.name}</span>
            </label>
          );
        })}
      </div>
    </div>

    <div className="flex gap-4 flex-col sm:flex-row">
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        更新📝
      </button>
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        削除🗑️
      </button>
    </div>

    {/* ===== コメント管理 ===== */}
    <div className="border-t pt-6">
      <h2 className="text-lg font-bold mb-3">コメント一覧💬</h2>

      {commentsLoading ? (
        <p>読み込み中...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">コメントはまだありません</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border rounded p-3 bg-gray-50 space-y-1"
            >
              <div className="text-sm text-gray-600 flex justify-between flex-wrap gap-1">
                <span>
                  {comment.user?.name ??
                    comment.user?.email ??
                    "匿名ユーザー"}
                </span>
                <span>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="whitespace-pre-wrap">{comment.content}</p>

              <button
                onClick={() => handleCommentDelete(comment.id)}
                className="text-sm text-red-600 hover:underline"
              >
                このコメントを削除🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </main>
);
};

export default EditPostPage;

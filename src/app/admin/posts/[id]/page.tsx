"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/app/_hooks/useAuth";

type Category = {
  id: string;
  name: string;
};

type EditPostResponse = {
  id: string;
  title: string;
  content: string;
  coverImageKey?: string | null;
  categories: {
    id: string;
    name: string;
  }[];
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

  const [categoryView, setCategoryView] = useState<CategoryView>("col2");
  const [categorySearch, setCategorySearch] = useState("");

  /* ---------------- 初期データ取得 ---------------- */
  useEffect(() => {
    if (authLoading || !token) return;

    const fetchData = async () => {
      try {
        const postRes = await fetch(`/api/admin/posts/${id}`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!postRes.ok) throw new Error();

        const post: EditPostResponse = await postRes.json();

        setTitle(post.title);
        setContent(post.content);
        setCoverImageKey(post.coverImageKey ?? null);
        setCategoryIds(post.categories.map((c) => c.id));

        const catRes = await fetch("/api/categories", {
          cache: "no-store",
        });
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
  const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files?.[0]) return;
  if (!session) {
    alert("ログイン情報がありません");
    return;
  }

  const file = e.target.files[0];
  const ext = file.name.split(".").pop();

  // 🔽 private 配下に保存
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

  /* ---------------- 更新 ---------------- */
  const handleUpdate = async () => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        coverImageKey,
        categoryIds,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "更新に失敗しました");
      return;
    }

    router.push("/admin/posts");
  };

  /* ---------------- 削除 ---------------- */
  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) return;

    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    router.push("/admin/posts");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="space-y-6 max-w-2xl">
      {/* ナビ */}
      <header className="flex gap-2">
        <Link href="/admin/posts" className="px-3 py-2 bg-gray-200 rounded">
          投稿記事一覧
        </Link>
        <Link href="/admin" className="px-3 py-2 bg-gray-200 rounded">
          管理画面トップ
        </Link>
      </header>

      <h1 className="text-xl font-bold">投稿編集</h1>

      {/* タイトル */}
      <div>
        <label className="font-semibold block mb-1">タイトル</label>
        <input
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 本文 */}
      <div>
        <label className="font-semibold block mb-1">本文</label>
        <textarea
          className="border p-2 w-full h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* カバー画像（キーのみ表示） */}
      <div>
        <label className="font-semibold block mb-1">カバー画像</label>

        {coverImageKey && (
          <div className="mb-2 text-sm">
            <div className="text-gray-600">現在の画像キー</div>
            <div className="bg-gray-100 p-2 rounded break-all">
              {coverImageKey}
            </div>
          </div>
        )}

        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="font-semibold block mb-1">カテゴリ</label>

        <input
          className="border px-2 py-1 w-full mb-2"
          placeholder="カテゴリ検索"
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
        />

        <div
          className={`grid gap-1 ${
            categoryView === "col2" ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {filteredCategories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* 操作 */}
      <div className="flex gap-4">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          更新
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          削除
        </button>
      </div>
    </main>
  );
};

export default EditPostPage;

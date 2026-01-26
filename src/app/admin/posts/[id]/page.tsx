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

  const [categoryView] = useState<CategoryView>("col2");
  const [categorySearch, setCategorySearch] = useState("");

  // 🔽 画像表示用
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null);

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

        // 🔽 既存画像（private）を表示するため signed URL を取得
        if (post.coverImageKey) {
          const { data } = await supabase.storage
            .from("cover-image")
            .createSignedUrl(post.coverImageKey, 60 * 5);

          setStoredImageUrl(data?.signedUrl ?? null);
        }

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

  /* ---------------- プレビューURL後始末 ---------------- */
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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
      alert("更新に失敗しました");
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
      {/* ヘッダー */}
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">投稿編集</h1>
        <div className="flex gap-2">
          <Link href="/admin/posts" className="px-3 py-2 bg-gray-200 rounded">
            投稿記事一覧
          </Link>
          <Link href="/admin" className="px-3 py-2 bg-gray-200 rounded">
            管理画面トップ
          </Link>
        </div>
      </header>

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

      {/* 画像選択 */}
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

        {/* 🔽 画像表示 */}
        {imagePreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreviewUrl}
            alt="preview"
            className="mt-2 h-32 rounded border object-contain"
          />
        ) : (
          storedImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storedImageUrl}
              alt="stored"
              className="mt-2 h-32 rounded border object-contain"
            />
          )
        )}
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

        <div className="grid grid-cols-2 gap-1">
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

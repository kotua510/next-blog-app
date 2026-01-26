"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/app/_hooks/useAuth";
import { supabase } from "@/utils/supabase";
import CryptoJS from "crypto-js";

/* ==========================
   型定義
   ========================== */
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type SelectableCategory = {
  id: string;
  name: string;
  isSelect: boolean;
};

/* ==========================
   ユーティリティ
   ========================== */
const calculateMD5Hash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  return CryptoJS.MD5(wordArray).toString();
};

const BUCKET_NAME = "cover-image";

const Page: React.FC = () => {
  const router = useRouter();
  const { isLoading: authLoading, session, token } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [coverImageKey, setCoverImageKey] = useState<string | undefined>();

  // ★ 画像プレビュー用
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [checkableCategories, setCheckableCategories] = useState<
    SelectableCategory[] | null
  >(null);

  const [categoryCols, setCategoryCols] = useState<2 | 3>(2);

  /* ==========================
     認証チェック
     ========================== */
  useEffect(() => {
    if (authLoading) return;
    if (!session) router.replace("/login");
  }, [authLoading, session, router]);

  /* ==========================
     カテゴリ取得
     ========================== */
  useEffect(() => {
    if (!session) return;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }

        const apiResBody = (await res.json()) as CategoryApiResponse[];

        setCheckableCategories(
          apiResBody.map((c) => ({
            id: c.id,
            name: c.name,
            isSelect: false,
          }))
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? `カテゴリ取得失敗: ${error.message}`
            : `予期せぬエラー: ${error}`;
        console.error(errorMsg);
        setFetchErrorMsg(errorMsg);
        setCheckableCategories(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [session]);

  const switchCategoryState = (id: string) => {
    if (!checkableCategories) return;
    setCheckableCategories(
      checkableCategories.map((c) =>
        c.id === id ? { ...c, isSelect: !c.isSelect } : c
      )
    );
  };

  /* ==========================
     画像アップロード
     ========================== */
  const handleImageUpload = async (file: File) => {
    const hash = await calculateMD5Hash(file);
    const path = `private/${hash}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, { upsert: true });

    if (error || !data) {
      alert("画像アップロードに失敗しました");
      return;
    }

    setCoverImageKey(data.path);
  };

  /* ==========================
     投稿処理
     ========================== */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);

    try {
      const requestBody = {
        title: newTitle,
        content: newContent,
        coverImageKey,
        categoryIds: checkableCategories
          ? checkableCategories.filter((c) => c.isSelect).map((c) => c.id)
          : [],
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const postResponse = await res.json();
      router.push(`/posts/${postResponse.id}`);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "予期せぬエラーが発生しました";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==========================
     プレビューURL解放
     ========================== */
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl); //ブラウザから一時的なURLを発行
      }
    };
  }, [imagePreviewUrl]);

  /* ==========================
     表示制御
     ========================== */
  if (authLoading || !session) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        認証確認中...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!checkableCategories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  /* ==========================
     JSX
     ========================== */
  return (
    <main className="space-y-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">投稿記事の新規作成</h1>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => router.push("/admin")}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            管理機能一覧へ
          </button>

          <button
            onClick={() => router.push("/admin/posts")}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            記事一覧へ
          </button>
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="text-gray-500">処理中...</div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={twMerge("space-y-4", isSubmitting && "opacity-50")}
      >
        <div>
          <label className="block font-bold">タイトル</label>
          <input
            className="w-full rounded-md border-2 px-2 py-1"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-bold">本文</label>
          <textarea
            className="h-48 w-full rounded-md border-2 px-2 py-1"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
          />
        </div>

        <div>
  <label className="block font-bold mb-1">カバー画像</label>

  {/* ボタン風ファイル選択 */}
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
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];

      setImagePreviewUrl(URL.createObjectURL(file));
      await handleImageUpload(file);
    }}
  />

  {imagePreviewUrl && (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagePreviewUrl}
        alt="cover preview"
        className="mt-2 h-32 rounded border object-contain"
      />
    </>
  )}

  {coverImageKey && (
    <div className="mt-1 break-all text-xs text-gray-500">
      coverImageKey: {coverImageKey}
    </div>
  )}
</div>

        <div className="flex items-center gap-2">
          <span className="font-bold">タグ表示</span>
          <button
            type="button"
            onClick={() => setCategoryCols(2)}
            className={`rounded border px-2 py-1 ${
              categoryCols === 2 ? "bg-blue-600 text-white" : ""
            }`}
          >
            2列
          </button>
          <button
            type="button"
            onClick={() => setCategoryCols(3)}
            className={`rounded border px-2 py-1 ${
              categoryCols === 3 ? "bg-blue-600 text-white" : ""
            }`}
          >
            3列
          </button>
        </div>

        <div
          className={twMerge(
            "grid gap-3",
            categoryCols === 2 ? "grid-cols-2" : "grid-cols-3"
          )}
        >
          {checkableCategories.map((c) => (
            <label key={c.id} className="flex gap-1">
              <input
                type="checkbox"
                checked={c.isSelect}
                onChange={() => switchCategoryState(c.id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-500 px-5 py-1 font-bold text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            記事を投稿
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;

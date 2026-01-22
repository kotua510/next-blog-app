"use client";
import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import Link from "next/link";

// ===== APIレスポンス型 =====
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// ===== ソートキー =====
type SortKey = "new" | "old" | "name";

// ===== ページ本体 =====
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryNameError, setNewCategoryNameError] = useState("");

  // 検索・ソート用
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("new");

  // カテゴリ配列
  const [categories, setCategories] = useState<Category[] | null>(null);

  // ===== カテゴリ取得 =====
  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/categories", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setCategories(null);
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const apiResBody = (await res.json()) as CategoryApiResponse[];

      setCategories(
        apiResBody.map((body) => ({
          id: body.id,
          name: body.name,
          createdAt: body.createdAt,
        }))
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ===== バリデーション =====
  const isValidCategoryName = (name: string): string => {
    if (name.length < 2 || name.length > 16) {
      return "2文字以上16文字以内で入力してください。";
    }
    if (categories && categories.some((c) => c.name === name)) {
      return "同じ名前のカテゴリが既に存在します。";
    }
    return "";
  };

  const updateNewCategoryName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryNameError(isValidCategoryName(e.target.value));
    setNewCategoryName(e.target.value);
  };

  // ===== 追加処理 =====
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      setNewCategoryName("");
      await fetchCategories();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリのPOSTリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== 検索 =====
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // ===== ソート =====
  const sortedCategories = useMemo(() => {
    const copy = [...filteredCategories];

    switch (sortKey) {
      case "new":
        return copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
      case "old":
        return copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      case "name":
        return copy.sort((a, b) =>
          a.name.localeCompare(b.name, "ja")
        );
      default:
        return copy;
    }
  }, [filteredCategories, sortKey]);

  // ===== ローディング・エラー =====
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!categories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  // ===== 表示 =====
  return (
    <main>
      <div className="mb-4 text-2xl font-bold">カテゴリの新規作成</div>

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
        className={twMerge("mb-6 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            名前
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="新しいカテゴリの名前"
            value={newCategoryName}
            onChange={updateNewCategoryName}
            autoComplete="off"
            required
          />
          {newCategoryNameError && (
            <div className="flex items-center text-sm font-bold text-red-500">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1" />
              {newCategoryNameError}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              newCategoryNameError !== "" ||
              newCategoryName === ""
            }
            className="rounded-md bg-indigo-500 px-5 py-1 font-bold text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            カテゴリを作成
          </button>
        </div>
      </form>

      <div className="mb-2 text-2xl font-bold">作成されたカテゴリの一覧</div>

      {/* 検索・ソートUI */}
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="カテゴリ名で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-md border px-2 py-1"
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-md border px-2 py-1"
        >
          <option value="new">新しい順</option>
          <option value="old">古い順</option>
          <option value="name">名前順</option>
        </select>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-gray-500">
          （条件に一致するカテゴリはありません）
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sortedCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-md border border-slate-400 px-2 py-0.5 text-slate-500"
            >
              <Link href={`/admin/categories/${category.id}`}>
                {category.name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;

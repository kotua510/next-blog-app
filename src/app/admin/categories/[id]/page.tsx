"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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

type SortKey = "new" | "old" | "name";

// ===== カテゴリ編集・削除ページ =====
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryNameError, setNewCategoryNameError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("new");

  const [currentCategoryName, setCurrentCategoryName] = useState<
    string | undefined
  >(undefined);

  // 動的ルートパラメータ
  const { id } = useParams() as { id: string };

  const router = useRouter();

  // カテゴリ一覧
  const [categories, setCategories] = useState<Category[] | null>(null);

  // ===== カテゴリ一覧取得 =====
  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/categories", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setCategories(null);
        throw new Error(
          `カテゴリの一覧のフェッチに失敗しました (${res.status}: ${res.statusText})`
        );
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
          ? error.message
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchCategories();
  }, []);

  // 現在のカテゴリ名を取得
  useEffect(() => {
    const currentCategory = categories?.find((c) => c.id === id);
    if (currentCategory) {
      setCurrentCategoryName(currentCategory.name);
    }
  }, [categories, id]);

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

  // ===== 名前変更 =====
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
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
          ? `カテゴリのPUTリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== 削除 =====
  const handleDelete = async () => {
    if (
      !window.confirm(
        `カテゴリ「${currentCategoryName}」を本当に削除しますか？`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      router.replace("/admin/categories");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリのDELETEリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
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

  // ===== 状態別表示 =====
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

  if (currentCategoryName === undefined) {
    return (
      <div className="text-red-500">
        指定された id のカテゴリは存在しません。
      </div>
    );
  }

  // ===== 表示 =====
  return (
    <main>
      <div className="mb-4 text-2xl font-bold">カテゴリの編集・削除</div>

      <form
        onSubmit={handleSubmit}
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-6">
          <div>
            <div className="font-bold">現在のカテゴリ名</div>
            <div className="text-gray-500">{currentCategoryName}</div>
          </div>

          <div className="space-y-1">
            <label htmlFor="name" className="block font-bold">
              新しいカテゴリ名
            </label>
            <input
              id="name"
              className="w-full rounded-md border-2 px-2 py-1"
              value={newCategoryName}
              onChange={updateNewCategoryName}
              autoComplete="off"
              required
            />
            {newCategoryNameError && (
              <div className="flex items-center text-sm font-bold text-red-500">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-1"
                />
                {newCategoryNameError}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              newCategoryNameError !== "" ||
              newCategoryName === ""
            }
            className="rounded-md bg-indigo-500 px-5 py-1 font-bold text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            名前を変更
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-red-500 px-5 py-1 font-bold text-white hover:bg-red-600"
          >
            削除
          </button>
        </div>
      </form>

      <div className="mb-2 text-2xl font-bold">既存カテゴリ一覧</div>
      
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

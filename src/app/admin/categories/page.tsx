"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

type AdminCategory = {
  id: string;
  name: string;
  createdAt: string;
};

type SortKey = "new" | "old" | "name";

const ITEMS_PER_PAGE = 8;

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("new");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("カテゴリ一覧の取得に失敗しました");
        }

        const data: AdminCategory[] = await res.json();
        setCategories(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "不明なエラー");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: string, name: string) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("ログインしてください");
    return;
  }

  if (!window.confirm(`「${name}」を削除しますか？`)) return;

  const res = await fetch(`/api/admin/categories/${categoryId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    alert("削除に失敗しました");
    return;
  }

  setCategories((prev) =>
    prev.filter((c) => c.id !== categoryId)
  );
};

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    if (keyword === "") return categories;

    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(keyword)
    );
  }, [categories, searchTerm]);

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

  const totalPages = Math.ceil(sortedCategories.length / ITEMS_PER_PAGE);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCategories, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
  <main className="space-y-6 px-4  mx-auto overflow-x-hidden">
    <div className="flex flex-col gap-2 sm:hidden">
      <Link
        href="/admin"
        className="px-3 py-2 bg-gray-200 rounded text-center w-full"
      >
        管理機能一覧
      </Link>
      <Link
        href="/admin/categories/new"
        className="px-3 py-2 bg-gray-200 rounded text-center w-full"
      >
        カテゴリ新規作成
      </Link>
      </div>
      
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
      <h1 className="text-2xl font-bold break-words">カテゴリ管理</h1>

      <div className="hidden sm:flex gap-2 flex-wrap">
        <Link
          href="/admin"
          className="px-3 py-2 bg-gray-200 rounded"
        >
          管理機能一覧
        </Link>
        <Link
          href="/admin/categories/new"
          className="px-3 py-2 bg-gray-200 rounded"
        >
          カテゴリ新規作成
        </Link>
      </div>
    </header>

    <div className="flex flex-wrap gap-2 items-center min-w-0">
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="カテゴリ名で検索🔍"
        className="border px-3 py-2 rounded w-full sm:w-auto sm:max-w-sm min-w-0"
      />

      <select
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value as SortKey)}
        className="border px-2 py-2 rounded shrink-0"
      >
        <option value="new">≡新しい順</option>
        <option value="old">≡古い順</option>
        <option value="name">≡名前順</option>
      </select>

      <div className="hidden sm:flex gap-2 ml-auto flex-wrap">
        <button
          onClick={() => setViewMode("list")}
          className={`px-3 py-2 border rounded whitespace-nowrap ${
            viewMode === "list" ? "bg-blue-600 text-white" : ""
          }`}
        >
          縦1列
        </button>

        <button
          onClick={() => setViewMode("grid")}
          className={`px-3 py-2 border rounded whitespace-nowrap ${
            viewMode === "grid" ? "bg-blue-600 text-white" : ""
          }`}
        >
          縦2列
        </button>
      </div>
    </div>

    <ul
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
          : "space-y-2"
      }
    >
      {paginatedCategories.map((cat) => (
        <li
          key={cat.id}
          className={`border rounded flex items-center justify-between gap-2 min-w-0 ${
            viewMode === "list" ? "p-3" : "p-2"
          }`}
        >
          <span className="font-medium break-words min-w-0">
            {cat.name}
          </span>

          <div className="flex gap-2 shrink-0 flex-wrap">
            <Link
              href={`/admin/categories/${cat.id}`}
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
            >
              編集✏️
            </Link>

            <button
              onClick={() => handleDelete(cat.id, cat.name)}
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 whitespace-nowrap"
            >
              削除🗑️
            </button>
          </div>
        </li>
      ))}
    </ul>

    {totalPages > 1 && (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    )}
  </main>
);
};

export default AdminCategoriesPage;
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/app/_types/Post";
import PostSummary from "@/app/_components/PostSummary";
import RankingSidebar from "@/app/_components/RankingSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

type ViewMode = "list" | "grid";
type SortKey = "new" | "old" | "title";
type CheckKey = "name" | "category";

type RankedPost = Post & { rank: number };

const ITEMS_PER_PAGE = 6;

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [checkKey, setCheckKey] = useState<CheckKey>("name");
  const [sortKey, setSortKey] = useState<SortKey>("new");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);


  /* ===== 投稿取得 ===== */
  /* ===== 投稿取得 ===== */
useEffect(() => {
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data: Post[] = await res.json();
      setPosts(data);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();

  // 👇 これが超重要（戻った時に再取得）
  const handleFocus = () => fetchPosts();
  window.addEventListener("focus", handleFocus);

  return () => window.removeEventListener("focus", handleFocus);
}, []);


  /* ===== 検索 ===== */
  const filteredPosts = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return posts;

    switch (checkKey) {
      case "name":
        return posts.filter((p) =>
          p.title.toLowerCase().includes(keyword)
        );
      case "category":
        return posts.filter((p) =>
          p.categories?.some((c) =>
            c.name.toLowerCase().includes(keyword)
          )
        );
      default:
        return posts;
    }
  }, [posts, searchTerm, checkKey]);

  /* ===== ソート ===== */
  const sortedPosts = useMemo(() => {
    const copy = [...filteredPosts];
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
      case "title":
        return copy.sort((a, b) =>
          a.title.localeCompare(b.title, "ja")
        );
      default:
        return copy;
    }
  }, [filteredPosts, sortKey]);

  


  /* ===== ページネーション ===== */
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPosts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, checkKey]);

  /* ===== ランキング生成（同率同順位） ===== */
  function buildRanking(
    posts: Post[],
    key: "likeCount" | "viewCount"
  ): RankedPost[] {
    const sorted = [...posts].sort((a, b) => b[key] - a[key]);

    let lastScore = -1;
    let currentRank = 0;

    return sorted.slice(0, 5).map((post, index) => {
      const score = post[key];

      if (score !== lastScore) {
        currentRank = index + 1;
        lastScore = score;
      }

      return { ...post, rank: currentRank };
    });
  }

  const likeRanking = useMemo(
    () => buildRanking(posts, "likeCount"),
    [posts]
  );

  const viewRanking = useMemo(
    () => buildRanking(posts, "viewCount"),
    [posts]
  );

  /* ===== 表示 ===== */
  if (loading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (fetchError) return <div>{fetchError}</div>;

  return (
  <main className="flex flex-col xl:flex-row gap-6 xl:gap-12 max-w-[1500px] mx-auto px-4 sm:px-6">
    {/* ================= 左：メイン ================= */}
    <div className="flex-[3] space-y-8">
      {/* ===== スマホ用ランキング（上部表示） ===== */}
      <section className="xl:hidden space-y-6">
        <RankingSidebar title="❤ いいねランキング👑" posts={likeRanking} />
        <RankingSidebar title="👀 閲覧数ランキング👑" posts={viewRanking} />
      </section>

      {/* ===== 検索・ソート ===== */}
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">記事一覧</h1>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="検索"
            className="border px-3 py-2 rounded w-full sm:max-w-sm"
          />

          <select
            value={checkKey}
            onChange={(e) => setCheckKey(e.target.value as CheckKey)}
            className="border px-2 py-2 rounded"
          >
            <option value="name">タイトル検索</option>
            <option value="category">カテゴリ検索</option>
          </select>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="border px-2 py-2 rounded"
          >
            <option value="new">≡新しい順</option>
            <option value="old">≡古い順</option>
            <option value="title">≡名前順</option>
          </select>
        </div>
      </section>

      {/* ===== 記事一覧 ===== */}
      <section>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "space-y-3"
          }
        >
          {paginatedPosts.map((post) => (
            <PostSummary key={post.id} post={post} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 flex-wrap mt-6">
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
      </section>
    </div>

    {/* ================= PC右サイドバー ================= */}
    <aside className="flex-[1] hidden xl:block space-y-6">
      <RankingSidebar title="❤ いいねランキング👑" posts={likeRanking} />
      <RankingSidebar title="👀 閲覧数ランキング👑" posts={viewRanking} />
    </aside>
  </main>
);
};

export default Page;

"use client";

import { useEffect, useState, useMemo } from "react";

type Suggestion = {
  id: string;
  title: string;
  content: string;
  isHandled: boolean;
  createdAt: string;
};

type Filter = "all" | "handled" | "unhandled";

const Page: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/suggestions")
      .then((r) => r.json())
      .then((d) => setSuggestions(d))
      .finally(() => setLoading(false));
  }, []);

  // ✅ 表示用フィルタ
  const filteredSuggestions = useMemo(() => {
    if (filter === "handled") {
      return suggestions.filter((s) => s.isHandled);
    }
    if (filter === "unhandled") {
      return suggestions.filter((s) => !s.isHandled);
    }
    return suggestions;
  }, [suggestions, filter]);

  const toggleHandled = async (id: string, current: boolean) => {
  try {
    const res = await fetch("/api/suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        isHandled: !current,
      }),
    });

    if (!res.ok) {
      alert("更新に失敗しました");
      return;
    }

    // ✅ 楽観更新
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isHandled: !current } : s
      )
    );
  } catch (e) {
    alert("通信エラー");
  }
  };
  
  const deleteHandled = async () => {
  if (!confirm("対応済みの意見をすべて削除しますか？")) return;

  try {
    const res = await fetch("/api/suggestions", {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    // ✅ state からも除去
    setSuggestions((prev) => prev.filter((s) => !s.isHandled));
  } catch (e) {
    alert("通信エラー");
  }
};

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">目安箱🗳️</h1>

  <button
    onClick={deleteHandled}
    className="text-sm px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
  >
    対応済みを一括削除🗑️
  </button>
</div>

      {/* ✅ トグル */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded border ${
            filter === "all" ? "bg-slate-800 text-white" : "bg-white"
          }`}
        >
          すべて
        </button>

        <button
          onClick={() => setFilter("unhandled")}
          className={`px-3 py-1 rounded border ${
            filter === "unhandled"
              ? "bg-slate-800 text-white"
              : "bg-white"
          }`}
        >
          未対応
        </button>

        <button
          onClick={() => setFilter("handled")}
          className={`px-3 py-1 rounded border ${
            filter === "handled"
              ? "bg-slate-800 text-white"
              : "bg-white"
          }`}
        >
          対応済み
        </button>
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="text-gray-500">該当する投稿がありません</div>
      )}

      <div className="space-y-4">
        {filteredSuggestions.map((s) => (
          <div
            key={s.id}
            className="border-2 border-slate-300 rounded-xl p-5 bg-white shadow-sm"
          >
            {/* タイトル＋対応状態 */}
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-lg">{s.title}</h2>

              <button
  onClick={() => toggleHandled(s.id, s.isHandled)}
  className={`text-xs px-2 py-1 rounded font-semibold transition ${
    s.isHandled
      ? "bg-green-100 text-green-700 hover:bg-green-200"
      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
  }`}
>
  {s.isHandled ? "対応済み" : "未対応"}
</button>
            </div>

            {/* 日付 */}
            <div className="text-xs text-gray-500 mb-3">
              {new Date(s.createdAt).toLocaleString()}
            </div>

            {/* 本文 */}
            <div className="whitespace-pre-wrap text-gray-800">
              {s.content}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Page;
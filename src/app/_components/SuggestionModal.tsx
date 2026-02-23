"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SuggestionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    if (!content.trim()) {
      alert("内容を入力してください");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ?? "送信に失敗しました");
        return;
      }

      alert("送信しました！");
      setTitle("");
      setContent("");
      onClose();
    } catch (e) {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-[520px] max-w-[90vw] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-lg mb-4">目安箱</h2>

        {/* ✅ タイトル */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="件名"
          className="w-full border rounded p-2 mb-3"
        />

        {/* ✅ 本文 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ご意見・ご要望・感想など自由に書いてください"
          className="w-full border rounded p-2 h-32"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:underline"
          >
            キャンセル
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "送信中..." : "送信"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;
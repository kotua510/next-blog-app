"use client";

import { useEffect, useState } from "react";

type Suggestion = {
  id: string;
  content: string;
  createdAt: string;
};

export default function Page() {
  const [list, setList] = useState<Suggestion[]>([]);

  useEffect(() => {
    fetch("/api/suggestions")
      .then((r) => r.json())
      .then(setList);
  }, []);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">目安箱一覧</h1>

      {list.map((s) => (
        <div key={s.id} className="border p-3 rounded">
          <div>{s.content}</div>
          <div className="text-xs text-gray-500">
            {new Date(s.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </main>
  );
}

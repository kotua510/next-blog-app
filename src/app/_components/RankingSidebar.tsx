import Link from "next/link";
import type { Post } from "@/app/_types/Post";

type RankedPost = Post & { rank: number };

type Props = {
  title: string;
  posts: RankedPost[];
};

const RankingSidebar: React.FC<Props> = ({ title, posts }) => {
  // 🔹 タイトルを2行に分割
  const isLike = title.includes("いいね");
  const mainTitle = isLike ? "いいね❤" : "閲覧数👀";

  // 🔹 順位ごとの色
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500"; // 🥇
    if (rank === 2) return "text-gray-400";   // 🥈
    if (rank === 3) return "text-amber-600";  // 🥉
    return "text-blue-600";
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md">
      {/* ===== タイトル（2行） ===== */}
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold leading-tight">
          {mainTitle}
        </h2>
        <div className="text-lg font-bold text-gray-500">
          ランキング
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`}>
            <div
              className="flex justify-between items-start
                         border-b pb-3
                         text-base
                         hover:text-blue-600
                         transition"
            >
              {/* ===== 左 ===== */}
              <span className="font-semibold leading-snug">
                <span
                  className={`text-lg font-bold mr-1 ${getRankColor(
                    p.rank
                  )}`}
                >
                  {/* 🥇 1位だけ王冠 */}
                  {p.rank === 1 ? "👑" : `#${p.rank}`}
                </span>
                {p.title}
              </span>

              {/* ===== 右 ===== */}
              <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
                {isLike ? p.likeCount : p.viewCount}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RankingSidebar;
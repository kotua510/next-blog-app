import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RecommendedItem = {
  id: string;
  title: string;
  coverImageKey: string | null;
  score?: number;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  

  try {
    // ================= 対象記事取得 =================
    const post = await prisma.post.findUnique({
  where: { id },
      include: {
        categories: true, // ← PostCategory[]
      },
    });

    if (!post) {
      return NextResponse.json([]);
    }

    // 🔥 中間テーブルから categoryId を取る
    const categoryIds = post.categories.map((c) => c.categoryId);

    let recommended: RecommendedItem[] = [];

    // ================= 類似記事取得 =================
    if (categoryIds.length > 0) {
      const candidates = await prisma.post.findMany({
        where: {
          id: { not: id },
          categories: {
            some: {
              categoryId: { in: categoryIds }, // ← ★ここが最重要修正
            },
          },
        },
        include: {
          categories: true,
        },
      });

      // 🔥 一致カテゴリ数でスコア計算
      recommended = candidates
        .map((p): RecommendedItem => {
          const matchCount = p.categories.filter((c) =>
            categoryIds.includes(c.categoryId) // ← ここも修正
          ).length;

          return {
            id: p.id,
            title: p.title,
            coverImageKey: p.coverImageKey,
            score: matchCount,
          };
        })
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 5);
    }

    // ================= 足りなければランダム補充 =================
if (recommended.length < 5) {
  const excludeIds = [id, ...recommended.map((r) => r.id)];

  // 🔥 多めに取得
  const pool = await prisma.post.findMany({
    where: {
      id: { notIn: excludeIds },
    },
    take: 30, // ← プールサイズ（調整可）
  });

  // 🔥 Fisher-Yates shuffle
  const shuffled = pool.sort(() => Math.random() - 0.5);

  const randomPosts = shuffled.slice(0, 5 - recommended.length);

  const randomItems: RecommendedItem[] = randomPosts.map((p) => ({
    id: p.id,
    title: p.title,
    coverImageKey: p.coverImageKey,
  }));

  recommended = [...recommended, ...randomItems];
}

    const response = recommended
      .slice(0, 5)
      .map(({ score, ...rest }) => rest);

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}
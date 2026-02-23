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
    const post = await prisma.post.findUnique({
  where: { id },
      include: {
        categories: true,
      },
    });

    if (!post) {
      return NextResponse.json([]);
    }

    const categoryIds = post.categories.map((c) => c.categoryId);

    let recommended: RecommendedItem[] = [];

    if (categoryIds.length > 0) {
      const candidates = await prisma.post.findMany({
        where: {
          id: { not: id },
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        },
        include: {
          categories: true,
        },
      });

      recommended = candidates
        .map((p): RecommendedItem => {
          const matchCount = p.categories.filter((c) =>
            categoryIds.includes(c.categoryId)
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

if (recommended.length < 5) {
  const excludeIds = [id, ...recommended.map((r) => r.id)];

  const pool = await prisma.post.findMany({
    where: {
      id: { notIn: excludeIds },
    },
    take: 30,
  });

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
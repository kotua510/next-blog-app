import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        summary: true,  

        viewCount: true,
        resultUrl: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,

      categories: post.categories.map((pc) => pc.category),
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      resultUrl: post.resultUrl,
      viewCount: post.viewCount,
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
};

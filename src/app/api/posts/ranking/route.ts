import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: [
        { viewCount: "desc" },   // 閲覧数優先
        { likes: { _count: "desc" } }, // 次にいいね
      ],
      take: 5, // 上位5件
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      title: p.title,
      viewCount: p.viewCount,
      likeCount: p._count.likes,
    }));

    return NextResponse.json(formatted);
  } catch (e) {
    return NextResponse.json({ error: "ranking error" }, { status: 500 });
  }
};

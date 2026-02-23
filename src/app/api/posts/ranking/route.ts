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
        { viewCount: "desc" },
        { likes: { _count: "desc" } },
      ],
      take: 5,
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

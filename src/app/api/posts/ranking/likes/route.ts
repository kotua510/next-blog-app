import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      _count: { select: { likes: true } },
    },
    orderBy: { likes: { _count: "desc" } },
    take: 5,
  });

  return NextResponse.json(
    posts.map((p) => ({
      id: p.id,
      title: p.title,
      likeCount: p._count.likes,
    }))
  );
};

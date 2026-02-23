import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      viewCount: true,
    },
    orderBy: { viewCount: "desc" },
    take: 5,
  });

  return NextResponse.json(posts);
};

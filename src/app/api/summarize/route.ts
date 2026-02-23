import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "idがありません" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      summary: true,
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: "記事が見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: post.id,
    title: post.title,
    summary: post.summary ?? "",
  });
}

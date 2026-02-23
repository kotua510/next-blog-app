import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getVisitorId } from "@/lib/visitor";

export const revalidate = 0;
export const dynamic = "force-dynamic"; 

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: postId } = await params;
    const visitorId = await getVisitorId();

    try {
      await prisma.postView.create({
        data: {
          postId,
          visitorId,
        },
      });

      await prisma.post.update({
        where: { id: postId },
        data: {
          viewCount: { increment: 1 },
        },
      });
    } catch {
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        coverImageKey: true,
        createdAt: true,
        resultUrl: true,
        viewCount: true,
        categories: {
          select: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...post,
      categories: post.categories.map((pc) => pc.category),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の取得に失敗しました" },
      { status: 500 }
    );
  }
};

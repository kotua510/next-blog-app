import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type RequestBody = {
  title: string;
  content: string;
  coverImageKey?: string;
  summary?: string; 
  categoryIds: string[];
  resultUrl?: string;
};

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "認証トークンがありません" },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json(
      { error: "認証に失敗しました" },
      { status: 401 }
    );
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
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
      },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      categories: post.categories.map((pc) => pc.category),
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "認証トークンがありません" },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json(
      { error: "認証に失敗しました" },
      { status: 401 }
    );
  }

  try {
    const body: RequestBody = await req.json();
    const {
      title,
      content,
      coverImageKey,
      categoryIds,
      summary,
      resultUrl,
    } = body;

    const normalizedResultUrl =
      resultUrl && resultUrl.trim() !== "" ? resultUrl : undefined;
    
    const normalizedSummary =
  summary && summary.trim() !== ""
    ? summary.trim().slice(0, 150)
    : undefined;

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "指定されたカテゴリのいくつかが存在しません" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        ...(coverImageKey && { coverImageKey }),
        ...(normalizedResultUrl && { resultUrl: normalizedResultUrl }),
        ...(normalizedSummary && { summary: normalizedSummary }),
      },
    });

    await prisma.postCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        postId: post.id,
        categoryId,
      })),
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の作成に失敗しました" },
      { status: 500 }
    );
  }
};

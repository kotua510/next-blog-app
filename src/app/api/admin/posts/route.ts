import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
export const dynamic = "force-dynamic"; // ◀ 〃

/* ==========================
   リクエストBody型
   ========================== */
type RequestBody = {
  title: string;
  content: string;
  coverImageKey?: string; // ← nullは使わない
  categoryIds: string[];
};

/* ==========================
   投稿一覧取得（GET）
   ========================== */
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

/* ==========================
   投稿作成（POST）
   ========================== */
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
    const { title, content, coverImageKey, categoryIds } = body;

    /* ===== カテゴリ存在チェック ===== */
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "指定されたカテゴリのいくつかが存在しません" },
        { status: 400 }
      );
    }

    /* ===== 投稿作成 ===== */
    const post = await prisma.post.create({
      data: {
        title,
        content,
        ...(coverImageKey && { coverImageKey }), // ← ここが超重要
      },
    });

    /* ===== 中間テーブル登録 ===== */
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

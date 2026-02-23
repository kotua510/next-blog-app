import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export const revalidate = 0;
export const dynamic = "force-dynamic";

/* ---------------- 認証共通処理 ---------------- */
const authenticate = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;
  return data.user;
};

/* ===================== GET ===================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      coverImageKey: true,
      summary: true,
      resultUrl: true,
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
    id: post.id,
    title: post.title,
    content: post.content,
    coverImageKey: post.coverImageKey,
    summary: post.summary,
    resultUrl: post.resultUrl,
    categories: post.categories.map((c) => c.category),
  });
}

/* ===================== PUT ===================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { title, content, coverImageKey, categoryIds, resultUrl, summary } =
    await req.json();

  // 更新対象データ
  const updateData: {
    title: string;
    content: string;
    coverImageKey?: string | null;
    summary?: string | null;
    resultUrl?: string | null;
  } = {
    title,
    content,
  };

  // coverImageKey の更新
  if (coverImageKey !== undefined) {
    updateData.coverImageKey = coverImageKey;
  }

  // resultUrl の更新
  if (resultUrl !== undefined) {
    updateData.resultUrl = resultUrl && resultUrl.trim() !== "" ? resultUrl : null;
  }

  // summary の更新
  if (summary !== undefined) {
    updateData.summary = summary && summary.trim() !== "" ? summary : null;
  }

  // トランザクションで更新
  await prisma.$transaction(async (tx) => {
    // 投稿更新
    await tx.post.update({
      where: { id },
      data: updateData,
    });

    // 既存のカテゴリを削除
    await tx.postCategory.deleteMany({
      where: { postId: id },
    });

    // 新しいカテゴリを作成
    if (categoryIds && categoryIds.length > 0) {
      await tx.postCategory.createMany({
        data: categoryIds.map((cid: string) => ({
          postId: id,
          categoryId: cid,
        })),
      });
    }
  });

  return NextResponse.json({ message: "更新しました" });
}

/* ===================== DELETE ===================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.post.delete({
    where: { id },
  });

  return NextResponse.json({ message: "削除しました" });
}

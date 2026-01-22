import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Category } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase";

export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
export const dynamic = "force-dynamic"; // ◀ 〃

type RequestBody = {
  name: string;
};

// 共通：認証チェック
const authenticate = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
};

/* ==========================
   GET：カテゴリ一覧取得
   ========================== */
export const GET = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("カテゴリ取得エラー:", error);
    return NextResponse.json(
      { error: "カテゴリ取得に失敗しました" },
      { status: 500 }
    );
  }
};

/* ==========================
   POST：カテゴリ作成
   ========================== */
export const POST = async (req: NextRequest) => {
  // 🔐 認証チェック
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { name }: RequestBody = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "カテゴリ名が不正です" },
        { status: 400 }
      );
    }

    const category: Category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの作成に失敗しました" },
      { status: 500 }
    );
  }
};

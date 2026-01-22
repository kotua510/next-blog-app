import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Category } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase";

type RouteParams = {
  params: {
    id: string;
  };
};

type RequestBody = {
  name: string;
};

/** 共通：Supabase 認証 */
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

/* =========================
   PUT: カテゴリ名変更
========================= */
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // 🔐 認証チェック
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ← ★ここが重要
    const { name }: RequestBody = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "カテゴリ名が不正です" },
        { status: 400 }
      );
    }

    const category: Category = await prisma.category.update({
      where: { id }, // ← params.id ではない
      data: { name },
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの名前変更に失敗しました" },
      { status: 500 }
    );
  }
};


/* =========================
   DELETE: カテゴリ削除
========================= */
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // 🔐 認証チェック
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ← ★ここ

    const category: Category = await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { msg: `「${category.name}」を削除しました。` },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの削除に失敗しました" },
      { status: 500 }
    );
  }
};

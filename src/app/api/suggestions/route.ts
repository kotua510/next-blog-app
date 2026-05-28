import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 禁則文字リスト
const NG_WORDS = [
  "ばか",
  "死ね",
  "NGワード1",
  "NGワード2"
];

function containsNgWord(text: string) {
  return NG_WORDS.some((w) => text.includes(w));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = body.title?.trim();
    const content = body.content?.trim();

    if (!title) {
      return NextResponse.json(
        { message: "タイトルが空です" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { message: "内容が空です" },
        { status: 400 }
      );
    }

    if (containsNgWord(title) || containsNgWord(content)) {
      return NextResponse.json(
        { message: "禁則文字が含まれています" },
        { status: 400 }
      );
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "投稿に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const list = await prisma.suggestion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isHandled } = body;

    if (!id || typeof isHandled !== "boolean") {
      return NextResponse.json(
        { message: "パラメータ不正" },
        { status: 400 }
      );
    }

    const updated = await prisma.suggestion.update({
      where: { id },
      data: { isHandled },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await prisma.suggestion.deleteMany({
      where: { isHandled: true },
    });

    return NextResponse.json({
      message: "削除完了",
      count: result.count,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
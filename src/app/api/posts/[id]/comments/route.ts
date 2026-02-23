import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorId } from "@/lib/visitor";

const NG_WORDS = [
  "死ね",
  "ばか",
  "アホ",
  "fuck",
  "shit",
  "くそ",
  "禁則ワード1",
  "禁則ワード2"
];

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFKC");
};

const containsNgWord = (text: string) => {
  const normalized = normalizeText(text);

  return NG_WORDS.some((word) =>
    normalized.includes(normalizeText(word))
  );
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visitorId = await getVisitorId();
  const body = await req.json();

  if (!body.content || !body.content.trim()) {
    return NextResponse.json(
      { message: "内容が空です" },
      { status: 400 }
    );
  }

  if (containsNgWord(body.content)) {
    return NextResponse.json(
      { message: "使用できない単語が含まれています" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      postId: id,
      content: body.content,
    },
  });

  return NextResponse.json({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    likeCount: 0,
    liked: false,
  });
}


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visitorId = await getVisitorId();

  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { likes: true } },
      likes: {
        where: { visitorId },
        select: { id: true },
      },
    },
  });

  const formatted = comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    likeCount: c._count.likes,
    liked: c.likes.length > 0,
  }));

  return NextResponse.json(formatted);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json({ message: "commentIdが必要" }, { status: 400 });
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: id,
      },
    });

    if (!comment) {
      return NextResponse.json({ message: "コメントが見つからない" }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "削除完了" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "削除失敗" }, { status: 500 });
  }
}


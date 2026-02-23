import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorId } from "@/lib/visitor";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visitorId = await getVisitorId();

  try {
    await prisma.commentLike.create({
      data: {
        commentId: id,
        visitorId,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "既にいいね済み" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visitorId = await getVisitorId();

  await prisma.commentLike.deleteMany({
    where: {
      commentId: id,
      visitorId,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visitorId = await getVisitorId();

  const count = await prisma.commentLike.count({
    where: { commentId: id },
  });

  const liked = await prisma.commentLike.findUnique({
    where: {
      commentId_visitorId: {
        commentId: id,
        visitorId,
      },
    },
  });

  return NextResponse.json({
    count,
    liked: !!liked,
  });
}
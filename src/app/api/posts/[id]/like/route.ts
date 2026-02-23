import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorId } from "@/lib/visitor";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const visitorId = await getVisitorId();

  try {
    await prisma.postLike.create({
      data: {
        postId: params.id,
        visitorId,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "既にいいね済み" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const visitorId = await getVisitorId();

  await prisma.postLike.deleteMany({
    where: {
      postId: params.id,
      visitorId,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const visitorId = await getVisitorId();

  const [count, liked] = await Promise.all([
    prisma.postLike.count({
      where: { postId: params.id },
    }),
    prisma.postLike.findFirst({
      where: {
        postId: params.id,
        visitorId,
      },
    }),
  ]);

  return NextResponse.json({
    count,
    liked: !!liked,
  });
}


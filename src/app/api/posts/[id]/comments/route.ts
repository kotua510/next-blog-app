import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  if (!body.content) {
    return NextResponse.json({ message: "内容が空" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId: params.id,
      content: body.content,
    },
  });

  return NextResponse.json(comment);
}

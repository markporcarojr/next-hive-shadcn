import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { inventorySchema } from "@/lib/schemas/inventory";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const item = await prisma.inventory.findUnique({
    where: { id: parseInt(params.id), userId: user.id },
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const item = await prisma.inventory.findUnique({
    where: { id: parseInt(params.id), userId: user.id },
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  await prisma.inventory.delete({
    where: { id: item.id },
  });

  return NextResponse.json(
    { message: "Item deleted successfully" },
    { status: 200 }
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = inventorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const item = await prisma.inventory.update({
    where: { id: parseInt(params.id), userId: user.id },
    data: parsed.data,
  });

  return NextResponse.json(item, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = inventorySchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const item = await prisma.inventory.update({
    where: { id: parseInt(params.id), userId: user.id },
    data: parsed.data,
  });

  return NextResponse.json(item, { status: 200 });
}

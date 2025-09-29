import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { inventoryApiSchema } from "@/lib/schemas/inventory";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const item = await prisma.inventory.findFirst({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (!item)
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[INVENTORY_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const parsed = inventoryApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const item = await prisma.inventory.update({
      where: { id: Number(resolvedParams.id), userId: user.id },
      data: parsed.data,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[INVENTORY_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const result = await prisma.inventory.deleteMany({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (result.count === 0)
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });

    return NextResponse.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("[INVENTORY_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}

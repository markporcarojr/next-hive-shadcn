import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch user settings
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create default settings
export async function POST(_req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.settings.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Settings already exist" },
        { status: 409 }
      );
    }

    const data = await _req.json();
    const newSettings = await prisma.settings.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    return NextResponse.json(newSettings);
  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: Update settings
export async function PATCH(_req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await _req.json();

    const updated = await prisma.settings.update({
      where: { userId: user.id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

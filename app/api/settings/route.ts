import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch user settings
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const settings = await prisma.settings.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(settings);
}

// POST: Create default settings
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const existing = await prisma.settings.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    return new NextResponse("Settings already exist", { status: 409 });
  }

  const data = await req.json();
  const newSettings = await prisma.settings.create({
    data: {
      ...data,
      userId: user.id,
    },
  });

  return NextResponse.json(newSettings);
}

// PATCH: Update settings
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const body = await req.json();

  const updated = await prisma.settings.update({
    where: { userId: user.id },
    data: body,
  });

  return NextResponse.json(updated);
}

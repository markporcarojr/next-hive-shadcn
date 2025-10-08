import { NextRequest, NextResponse } from "next/server";
// import { Harvest } from "@/lib/models/harvest"; // placeholder
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const harvest = await prisma.harvest.findUnique({
      where: { id: Number(id) },
    });

    if (!harvest) {
      return NextResponse.json(
        { message: "Harvest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(harvest, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _req.json();
    const { harvestAmount, harvestType, harvestDate } = body;

    if (!harvestAmount || !harvestType || !harvestDate) {
      return NextResponse.json(
        { message: "Fill out all required fields" },
        { status: 400 }
      );
    }

    // const result = await Harvest.findByIdAndUpdate(id, body);
    const result = { id, updated: true }; // mock

    return NextResponse.json(
      { message: "Harvest updated successfully", result },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// export async function DELETE(
//   _: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = params;

//     const result = await Harvest.findByIdAndDelete(id);
//     // const result = { id, deleted: true }; // mock

//     return NextResponse.json(
//       { message: "Harvest deleted successfully", result },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Missing or invalid harvest ID" },
        { status: 400 }
      );
    }

    const harvest = await prisma.harvest.deleteMany({
      where: {
        id: Number(id), // <-- convert here
        userId: user.id,
      },
    });

    if (harvest.count === 0) {
      return NextResponse.json(
        { message: "Harvest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Harvest deleted successfully" });
  } catch (error) {
    console.error("[HARVEST_DELETE]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

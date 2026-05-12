import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (auth.role === "CONSULTANT") {
      const assignments = await prisma.consultantAssignment.findMany({
        where: { consultantId: auth.userId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ assignments });
    }

    const assignments = await prisma.consultantAssignment.findMany({
      where: { userId: auth.userId },
      include: {
        consultant: {
          select: {
            id: true,
            name: true,
            consultantProfile: {
              select: {
                title: true,
                experience: true,
                hourlyRate: true,
                verified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Consultant Assignments Error:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role === "CONSULTANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const consultantId = body?.consultantId as string | undefined;
    const note = body?.note as string | undefined;

    if (!consultantId) {
      return NextResponse.json({ error: "Consultant ID required" }, { status: 400 });
    }

    const consultant = await prisma.user.findUnique({
      where: { id: consultantId },
      select: { id: true, role: true },
    });

    if (!consultant || consultant.role !== "CONSULTANT") {
      return NextResponse.json({ error: "Invalid consultant" }, { status: 400 });
    }

    const existing = await prisma.consultantAssignment.findFirst({
      where: {
        userId: auth.userId,
        consultantId,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json({ assignment: existing, message: "Already requested" });
    }

    const assignment = await prisma.consultantAssignment.create({
      data: {
        userId: auth.userId,
        consultantId,
        note: note || null,
      },
    });

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Create Consultant Assignment Error:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "CONSULTANT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const assignmentId = body?.assignmentId as string | undefined;
    const status = body?.status as string | undefined;

    const allowedStatuses = ["ACCEPTED", "REJECTED", "CLOSED"];
    if (!assignmentId || !status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const assignment = await prisma.consultantAssignment.findUnique({
      where: { id: assignmentId },
      select: { consultantId: true, status: true },
    });

    if (!assignment || assignment.consultantId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.consultantAssignment.update({
      where: { id: assignmentId },
      data: { status },
    });

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    console.error("Update Consultant Assignment Error:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

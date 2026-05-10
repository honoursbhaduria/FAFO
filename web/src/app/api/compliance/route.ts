import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let tasks = await prisma.complianceTask.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });

    // If no tasks exist, generate some default ones based on profile
    if (tasks.length === 0) {
      const profile = await prisma.businessProfile.findUnique({
        where: { userId },
      });

      if (profile) {
        const defaultTasks = [];
        const now = new Date();
        
        // 1. GST Filing (if GSTIN provided or just as default)
        const gstDate = new Date(now.getFullYear(), now.getMonth(), 20);
        if (gstDate < now) gstDate.setMonth(gstDate.getMonth() + 1);
        
        defaultTasks.push({
          userId,
          title: "GSTR-3B Filing",
          description: "Monthly self-declared summary return for GST.",
          dueDate: gstDate,
          type: "Tax",
          status: "PENDING",
        });

        // 2. TDS Deposit
        const tdsDate = new Date(now.getFullYear(), now.getMonth(), 7);
        if (tdsDate < now) tdsDate.setMonth(tdsDate.getMonth() + 1);

        defaultTasks.push({
          userId,
          title: "TDS Deposit",
          description: "Monthly deposit of tax deducted at source.",
          dueDate: tdsDate,
          type: "Compliance",
          status: "PENDING",
        });

        // 3. ITR Filing (Annual)
        defaultTasks.push({
          userId,
          title: "Income Tax Return",
          description: "Annual income tax filing for the business.",
          dueDate: new Date(now.getFullYear(), 6, 31), // July 31st
          type: "Tax",
          status: "PENDING",
        });

        await prisma.complianceTask.createMany({
          data: defaultTasks,
        });

        tasks = await prisma.complianceTask.findMany({
          where: { userId },
          orderBy: { dueDate: "asc" },
        });
      }
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[Compliance API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, dueDate, type } = body;

    const task = await prisma.complianceTask.create({
      data: {
        userId,
        title,
        description,
        dueDate: new Date(dueDate),
        type,
        status: "PENDING",
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, status } = body;

    const task = await prisma.complianceTask.findUnique({ where: { id } });
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.complianceTask.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const task = await prisma.complianceTask.findUnique({ where: { id } });
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.complianceTask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
